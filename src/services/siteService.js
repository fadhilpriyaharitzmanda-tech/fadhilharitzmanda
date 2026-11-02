import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { personalInfo, projects as defaultProjects } from '../data/portfolioData';

/**
 * Extract relative file path in a public Supabase Storage bucket
 */
export const extractStoragePath = (url, bucket = 'project-images') => {
  if (!url || typeof url !== 'string') return null;
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rawPath = url.substring(idx + marker.length).split('?')[0];
  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
};

/**
 * Check if current user is admin via Supabase RPC public.is_admin()
 */
export const checkIsAdmin = async () => {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.warn('RPC is_admin error:', error.message);
      return false;
    }
    return data === true;
  } catch (err) {
    console.warn('checkIsAdmin exception:', err);
    return false;
  }
};

/**
 * Fetch site profile (single row with id=1)
 */
export const fetchSiteProfile = async () => {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('site_profile')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.warn('fetchSiteProfile error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('fetchSiteProfile exception:', err);
    return null;
  }
};

/**
 * Upsert site profile row (id=1)
 */
export const updateSiteProfile = async (profileData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  const payload = {
    id: 1,
    status: profileData.status || 'STATUS: READY TO BUILD',
    first_name: (profileData.first_name || '').trim(),
    last_name: (profileData.last_name || '').trim(),
    bio: profileData.bio || '',
    tags: profileData.tags || '',
    cv_url: profileData.cv_url || '',
  };

  if (!payload.first_name || !payload.last_name) {
    throw new Error('Nama depan dan belakang wajib diisi.');
  }

  const { data, error } = await supabase
    .from('site_profile')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch published projects for public website
 * Ordered by year desc, created_at desc, only published=true
 */
export const fetchPublishedProjects = async () => {
  if (!isSupabaseConfigured) return defaultProjects;
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchPublishedProjects error from Supabase:', error);
      return defaultProjects;
    }

    if (!data || data.length === 0) {
      return defaultProjects;
    }

    // Map database rows to UI structure and enrich with rich modal fields if matched
    const dbProjects = data.map((p) => {
      const matched = defaultProjects.find(
        (def) => def.title.toLowerCase().trim() === (p.title || '').toLowerCase().trim()
      );

      const imagesArray = Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : (matched?.images ? matched.images.map((img) => (typeof img === 'string' ? img : img.src)) : (matched?.image ? [matched.image] : []));

      const coverImage = imagesArray[0] || matched?.image || '/images/profile-hero.jpg';

      return {
        id: p.id,
        title: p.title || '',
        description: p.description || matched?.description || '',
        year: p.year || (p.created_at ? new Date(p.created_at).getFullYear() : (matched?.year ? parseInt(matched.year, 10) : 2026)),
        category: p.category || matched?.category || 'Web',
        problem_context: p.problem_context || matched?.problem || matched?.overview || '',
        solution: p.solution || matched?.solution || '',
        highlights: Array.isArray(p.highlights) && p.highlights.length > 0
          ? p.highlights
          : (matched?.features || []),
        tech: p.tech || matched?.technologies?.join(', ') || '',
        technologies: p.tech
          ? p.tech.split(',').map((t) => t.trim()).filter(Boolean)
          : (matched?.technologies || []),
        repo_url: p.repo_url || matched?.links?.github || '',
        demo_url: p.demo_url || matched?.links?.demo || '',
        links: {
          demo: p.demo_url || matched?.links?.demo || '',
          github: p.repo_url || matched?.links?.github || '',
        },
        images: imagesArray,
        image: coverImage,
        published: p.published,
        created_at: p.created_at,
      };
    });

    // Ensure the 4 original projects from defaultProjects are always included if not yet in database
    const existingTitles = new Set(dbProjects.map((p) => p.title.toLowerCase().trim()));
    const missingDefaults = defaultProjects
      .filter((def) => !existingTitles.has(def.title.toLowerCase().trim()))
      .map((def) => ({
        ...def,
        problem_context: def.problem || def.overview || '',
        highlights: def.features || [],
        repo_url: def.links?.github || '',
        demo_url: def.links?.demo || '',
        images: def.images ? def.images.map((img) => (typeof img === 'string' ? img : img.src)) : (def.image ? [def.image] : []),
        tech: def.technologies ? def.technologies.join(', ') : '',
      }));

    const combined = [...dbProjects, ...missingDefaults];
    // Sort combined by year desc then created_at desc
    combined.sort((a, b) => (b.year || 0) - (a.year || 0));
    return combined;
  } catch (err) {
    console.error('fetchPublishedProjects exception:', err);
    return defaultProjects;
  }
};

/**
 * Import default 4 projects into Supabase if not yet present
 */
export const importDefaultProjectsToSupabase = async () => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');

  const current = await fetchAllProjectsAdmin();
  const currentTitles = new Set((current || []).map((p) => (p.title || '').toLowerCase().trim()));

  const toInsert = defaultProjects
    .filter((def) => !currentTitles.has(def.title.toLowerCase().trim()))
    .map((def) => {
      const imagesArr = def.images
        ? def.images.map((img) => (typeof img === 'string' ? img : img.src))
        : (def.image ? [def.image] : []);

      return {
        id: crypto.randomUUID(),
        title: def.title,
        description: def.description || '',
        year: parseInt(def.year, 10) || 2026,
        category: def.category || 'Web',
        problem_context: def.problem || def.overview || '',
        solution: def.solution || '',
        highlights: def.features || [],
        tech: def.technologies ? def.technologies.join(', ') : '',
        repo_url: def.links?.github || '',
        demo_url: def.links?.demo || '',
        images: imagesArr,
        published: true,
      };
    });

  if (toInsert.length === 0) {
    return { count: 0, message: 'Semua 4 project bawaan sudah ada di database.' };
  }

  // Insert rows one by one to ensure each is saved and robust against single-item errors
  const inserted = [];
  for (const item of toInsert) {
    const { data, error } = await supabase.from('projects').insert([item]).select().single();
    if (error) {
      console.error(`Gagal menyimpan project "${item.title}":`, error);
    } else if (data) {
      inserted.push(data);
    }
  }

  return { count: inserted.length, data: inserted };
};

/**
 * Fetch all projects for admin dashboard (published + drafts)
 * Ordered by year desc, created_at desc
 */
export const fetchAllProjectsAdmin = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Upload multiple images to the "project-images" public bucket
 * Path: projects/<project-id>/<uuid>.<ext>
 * - Validates: image/* only, max 2MB per file
 * - Max 6 images per project
 * - If partial upload fails, returns errors and does NOT store failed URLs
 */
export const uploadProjectImages = async (files, projectId) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  if (!files || files.length === 0) return { urls: [], errors: [] };

  const validUrls = [];
  const errors = [];

  for (const file of files) {
    try {
      if (!file.type.startsWith('image/')) {
        errors.push(`"${file.name}" bukan format gambar yang valid.`);
        continue;
      }

      const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
      if (file.size > MAX_SIZE) {
        errors.push(`"${file.name}" melebihi ukuran maksimal 2 MB.`);
        continue;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const imageId = crypto.randomUUID();
      const storagePath = `projects/${projectId}/${imageId}.${ext.toLowerCase()}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        errors.push(`Gagal mengunggah "${file.name}": ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(storagePath);

      if (publicUrlData?.publicUrl) {
        validUrls.push(publicUrlData.publicUrl);
      }
    } catch (err) {
      errors.push(`Error pada "${file.name}": ${err.message || 'Gagal'}`);
    }
  }

  return { urls: validUrls, errors };
};

/**
 * Delete single image from project-images bucket
 */
export const deleteProjectImage = async (imageUrl) => {
  if (!imageUrl) return;
  const path = extractStoragePath(imageUrl, 'project-images');
  if (!path) return;

  try {
    const { error } = await supabase.storage
      .from('project-images')
      .remove([path]);
    if (error) {
      console.warn('Error deleting image from storage:', error.message);
    }
  } catch (err) {
    console.warn('deleteProjectImage exception:', err);
  }
};

/**
 * Delete multiple images from project-images bucket
 */
export const deleteProjectImages = async (imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
  const paths = imageUrls
    .map((url) => extractStoragePath(url, 'project-images'))
    .filter(Boolean);
  if (paths.length === 0) return;

  try {
    const { error } = await supabase.storage
      .from('project-images')
      .remove(paths);
    if (error) {
      console.warn('Error deleting images from storage:', error.message);
    }
  } catch (err) {
    console.warn('deleteProjectImages exception:', err);
  }
};

/**
 * Create a new project with expanded schema
 */
export const createProject = async (projectData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  if (!projectData.title?.trim()) {
    throw new Error('Judul project wajib diisi.');
  }

  const payload = {
    id: projectData.id || crypto.randomUUID(),
    title: projectData.title.trim(),
    description: projectData.description || '',
    year: parseInt(projectData.year, 10) || new Date().getFullYear(),
    category: projectData.category || 'Web',
    problem_context: projectData.problem_context || '',
    solution: projectData.solution || '',
    highlights: Array.isArray(projectData.highlights) ? projectData.highlights : [],
    tech: projectData.tech || '',
    repo_url: projectData.repo_url || '',
    demo_url: projectData.demo_url || '',
    images: Array.isArray(projectData.images) ? projectData.images : [],
    published: Boolean(projectData.published),
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update project and delete any removed images from storage
 */
export const updateProject = async (id, projectData, deletedImageUrls = []) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  if (!projectData.title?.trim()) {
    throw new Error('Judul project wajib diisi.');
  }

  const payload = {
    title: projectData.title.trim(),
    description: projectData.description || '',
    year: parseInt(projectData.year, 10) || new Date().getFullYear(),
    category: projectData.category || 'Web',
    problem_context: projectData.problem_context || '',
    solution: projectData.solution || '',
    highlights: Array.isArray(projectData.highlights) ? projectData.highlights : [],
    tech: projectData.tech || '',
    repo_url: projectData.repo_url || '',
    demo_url: projectData.demo_url || '',
    images: Array.isArray(projectData.images) ? projectData.images : [],
    published: Boolean(projectData.published),
  };

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Clean up any deleted images from Storage
  if (Array.isArray(deletedImageUrls) && deletedImageUrls.length > 0) {
    await deleteProjectImages(deletedImageUrls);
  }

  return data;
};

/**
 * Delete project and remove all its images from storage
 */
export const deleteProject = async (id, images = []) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;

  if (Array.isArray(images) && images.length > 0) {
    await deleteProjectImages(images);
  } else if (typeof images === 'string') {
    await deleteProjectImage(images);
  }
};

/**
 * Toggle published state of a project
 */
export const toggleProjectPublished = async (id, currentPublished) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase
    .from('projects')
    .update({ published: !currentPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch guestbook messages for admin management
 */
export const fetchAdminGuestbook = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('guestbook')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Delete a guestbook message (admin policy allows deleting any message)
 */
export const deleteAdminGuestbookMessage = async (id) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  const { error } = await supabase
    .from('guestbook')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Fetch guestbook ratings summary
 */
export const fetchRatingsSummary = async () => {
  if (!isSupabaseConfigured) return { average: '0.0', count: 0, ratings: [] };
  try {
    const { data, error } = await supabase
      .from('guestbook_ratings')
      .select('rating');
    if (error || !data || data.length === 0) {
      return { average: '0.0', count: 0, ratings: [] };
    }
    const sum = data.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
    const avg = (sum / data.length).toFixed(1);
    return {
      average: avg,
      count: data.length,
      ratings: data.map((d) => d.rating),
    };
  } catch (err) {
    console.warn('fetchRatingsSummary exception:', err);
    return { average: '0.0', count: 0, ratings: [] };
  }
};
