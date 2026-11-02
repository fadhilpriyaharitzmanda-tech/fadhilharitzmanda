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
    return Boolean(data);
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
 */
export const fetchPublishedProjects = async () => {
  if (!isSupabaseConfigured) return defaultProjects;
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return defaultProjects;
    }

    // Map database rows to UI structure while keeping compatibility
    return data.map((p, idx) => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      tech: p.tech || '',
      technologies: p.tech
        ? p.tech.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      category: 'Web',
      year: p.created_at ? new Date(p.created_at).getFullYear().toString() : '2026',
      image: p.image_url || '/images/profile-hero.jpg',
      links: {
        demo: p.demo_url || '',
        github: p.repo_url || '',
      },
      published: p.published,
      created_at: p.created_at,
    }));
  } catch (err) {
    console.warn('fetchPublishedProjects exception:', err);
    return defaultProjects;
  }
};

/**
 * Fetch all projects for admin dashboard (published + drafts)
 */
export const fetchAllProjectsAdmin = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Upload an image to the "project-images" public bucket
 * - Validates: image/* only, max 2MB
 * - Random filename: `${crypto.randomUUID()}.${ext}`
 * - Returns publicUrl
 */
export const uploadProjectImage = async (file) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  if (!file) throw new Error('Pilih file gambar terlebih dahulu.');

  if (!file.type.startsWith('image/')) {
    throw new Error('Format file harus berupa gambar (image/*).');
  }

  const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran gambar maksimal adalah 2 MB.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const randomName = `${crypto.randomUUID()}.${ext.toLowerCase()}`;

  const { error: uploadError } = await supabase.storage
    .from('project-images')
    .upload(randomName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('project-images')
    .getPublicUrl(randomName);

  return publicUrlData.publicUrl;
};

/**
 * Delete image from project-images bucket
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
      console.warn('Error deleting old image from storage:', error.message);
    }
  } catch (err) {
    console.warn('deleteProjectImage exception:', err);
  }
};

/**
 * Create a new project
 */
export const createProject = async (projectData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  if (!projectData.title?.trim()) {
    throw new Error('Judul project wajib diisi.');
  }

  const payload = {
    title: projectData.title.trim(),
    description: projectData.description || '',
    tech: projectData.tech || '',
    demo_url: projectData.demo_url || '',
    repo_url: projectData.repo_url || '',
    image_url: projectData.image_url || null,
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
 * Update project and delete old image if replaced
 */
export const updateProject = async (id, projectData, oldImageUrl) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');
  if (!projectData.title?.trim()) {
    throw new Error('Judul project wajib diisi.');
  }

  const payload = {
    title: projectData.title.trim(),
    description: projectData.description || '',
    tech: projectData.tech || '',
    demo_url: projectData.demo_url || '',
    repo_url: projectData.repo_url || '',
    image_url: projectData.image_url !== undefined ? projectData.image_url : null,
    published: Boolean(projectData.published),
  };

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // If image was changed, delete the old image from storage
  if (oldImageUrl && projectData.image_url && oldImageUrl !== projectData.image_url) {
    await deleteProjectImage(oldImageUrl);
  }

  return data;
};

/**
 * Delete project and remove its image from storage
 */
export const deleteProject = async (id, imageUrl) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.');

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;

  if (imageUrl) {
    await deleteProjectImage(imageUrl);
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
