import React, { useState, useEffect, useRef } from 'react';
import {
  fetchSiteProfile,
  updateSiteProfile,
  fetchAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublished,
  uploadProjectImages,
  deleteProjectImages,
  fetchAdminGuestbook,
  deleteAdminGuestbookMessage,
  fetchRatingsSummary,
  importDefaultProjectsToSupabase,
  fetchAllExperiencesAdmin,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleExperiencePublished,
  uploadExperienceImages,
  formatExperiencePeriod,
  importDefaultExperiencesToSupabase,
  fetchAllCertificationsAdmin,
  createCertification,
  updateCertification,
  deleteCertification,
  toggleCertificationPublished,
  uploadCertificationImages,
  formatCertificationDate,
  importDefaultCertificationsToSupabase,
} from '../../services/siteService';
import {
  projects as defaultProjects,
  experiences as defaultExperiencesData,
  certifications as defaultCertificationsData,
} from '../../data/portfolioData';
import { useSiteData } from '../../context/SiteContext';
import './AdminDashboard.css';

const COLORS = ['#b3121a', '#1f4fb4', '#1a9e4a', '#c77a00'];
const CATEGORIES = ['Web', 'Mobile', 'Game', 'Desktop', 'Lainnya'];

const LegoLogo = ({ className = 'logo' }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <rect x="9" y="21" width="48" height="38" rx="4" fill="#141414" />
    <rect x="11" y="7" width="14" height="10" rx="2.5" fill="#b3121a" stroke="#141414" strokeWidth="3.5" />
    <rect x="31" y="7" width="14" height="10" rx="2.5" fill="#b3121a" stroke="#141414" strokeWidth="3.5" />
    <rect x="4" y="16" width="48" height="38" rx="4" fill="#b3121a" stroke="#141414" strokeWidth="4" />
    <path fill="#ffd500" d="M19 24h20v6H25v3h9v5h-9v9h-6z" />
  </svg>
);

const Icon = ({ name }) => {
  const paths = {
    home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
    proj: (
      <>
        <rect x="3" y="9" width="18" height="11" rx="2" />
        <path d="M7 9V6h3v3M14 9V6h3v3" />
      </>
    ),
    exp: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V4h6v3M3 13h18" />
      </>
    ),
    cert: (
      <>
        <circle cx="12" cy="9" r="6" />
        <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
      </>
    ),
    chat: <path d="M4 5h16v11H9l-5 4z" />,
    edit: <path d="M4 20h4L19 9l-4-4L4 16z" />,
    del: (
      <>
        <path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    out: <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />,
    save: (
      <>
        <path d="M5 4h12l2 2v14H5zM8 4v5h7V4M8 20v-6h8v6" />
      </>
    ),
    back: <path d="M19 12H5M12 19l-7-7 7-7" />,
    external: <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />,
  };

  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

export default function AdminDashboard({ user, onLogout, onNavigateHome }) {
  const { refreshSiteData } = useSiteData();

  // Active view
  const [view, setView] = useState('home'); // 'home' | 'profile' | 'projects' | 'exp' | 'cert' | 'guest'

  // Data states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    status: '',
    bio: '',
    tags: '',
    cv_url: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [projectsList, setProjectsList] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [experiencesList, setExperiencesList] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  const [certificationsList, setCertificationsList] = useState([]);
  const [certificationsLoading, setCertificationsLoading] = useState(false);

  const [guestMessages, setGuestMessages] = useState([]);
  const [ratingsInfo, setRatingsInfo] = useState({ average: '0.0', count: 0, ratings: [] });
  const [guestLoading, setGuestLoading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg('');
    }, 2200);
  };

  // Project Modal State with expanded schema
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    id: '',
    year: new Date().getFullYear(),
    category: 'Web',
    title: '',
    description: '',
    problem_context: '',
    solution: '',
    highlightsText: '',
    tech: '',
    repo_url: '',
    demo_url: '',
    images: [],
    published: true,
  });
  const [deletedImagesOnEdit, setDeletedImagesOnEdit] = useState([]);
  const [projectUploading, setProjectUploading] = useState(false);
  const [projectModalError, setProjectModalError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImportDefaults = async () => {
    setImporting(true);
    try {
      const res = await importDefaultProjectsToSupabase();
      await loadAdminData();
      await refreshSiteData();
      showToast(
        res.count > 0
          ? `${res.count} project bawaan berhasil dipulihkan!`
          : 'Semua 4 project bawaan sudah ada di database.'
      );
    } catch (err) {
      console.error('Import error:', err);
      showToast(err.message || 'Gagal memulihkan project.');
    } finally {
      setImporting(false);
    }
  };

  // Experience Modal State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expForm, setExpForm] = useState({
    id: '',
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    title: '',
    organization: '',
    location: '',
    description: '',
    highlightsText: '',
    tech: '',
    images: [],
    published: true,
  });
  const [deletedExpImages, setDeletedExpImages] = useState([]);
  const [expUploading, setExpUploading] = useState(false);
  const [expModalError, setExpModalError] = useState('');
  const [importingExp, setImportingExp] = useState(false);

  const handleImportDefaultExps = async () => {
    setImportingExp(true);
    try {
      const res = await importDefaultExperiencesToSupabase();
      await loadAdminData();
      await refreshSiteData();
      showToast(
        res.count > 0
          ? `${res.count} experience bawaan berhasil dipulihkan!`
          : 'Semua experience bawaan sudah ada di database.'
      );
    } catch (err) {
      console.error('Import experiences error:', err);
      showToast(err.message || 'Gagal memulihkan experience.');
    } finally {
      setImportingExp(false);
    }
  };

  // Certification Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [certForm, setCertForm] = useState({
    id: '',
    issued_on: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    title: '',
    issuer: '',
    description: '',
    credential_id: '',
    images: [],
    published: true,
  });
  const [deletedCertImages, setDeletedCertImages] = useState([]);
  const [certUploading, setCertUploading] = useState(false);
  const [certModalError, setCertModalError] = useState('');
  const [importingCert, setImportingCert] = useState(false);

  const handleImportDefaultCerts = async () => {
    setImportingCert(true);
    try {
      const res = await importDefaultCertificationsToSupabase();
      await loadAdminData();
      await refreshSiteData();
      showToast(
        res.count > 0
          ? `${res.count} sertifikasi bawaan berhasil dipulihkan!`
          : 'Semua sertifikasi bawaan sudah ada di database.'
      );
    } catch (err) {
      console.error('Import certifications error:', err);
      showToast(err.message || 'Gagal memulihkan sertifikasi.');
    } finally {
      setImportingCert(false);
    }
  };

  // Fetch all admin data (only runs when AdminGate grants status === 'ok')
  const loadAdminData = async () => {
    try {
      setProjectsLoading(true);
      setExperiencesLoading(true);
      setCertificationsLoading(true);
      setGuestLoading(true);

      const [profData, projsData, msgsData, ratingData, expsData, certsData] = await Promise.all([
        fetchSiteProfile(),
        fetchAllProjectsAdmin(),
        fetchAdminGuestbook(),
        fetchRatingsSummary(),
        fetchAllExperiencesAdmin(),
        fetchAllCertificationsAdmin(),
      ]);

      if (profData) {
        setProfileForm({
          first_name: profData.first_name || '',
          last_name: profData.last_name || '',
          status: profData.status || '',
          bio: profData.bio || '',
          tags: profData.tags || '',
          cv_url: profData.cv_url || '',
        });
      }

      let currentProjs = projsData || [];
      // If database has 0 projects, auto-import the 4 default projects so they are stored in DB
      if (currentProjs.length === 0) {
        try {
          const importRes = await importDefaultProjectsToSupabase();
          if (importRes && importRes.count > 0) {
            currentProjs = await fetchAllProjectsAdmin();
          }
        } catch (importErr) {
          console.warn('Auto-import default projects to database:', importErr);
        }
      }

      let currentExps = expsData || [];
      // If database has 0 experiences, auto-import defaults
      if (currentExps.length === 0) {
        try {
          const importExpRes = await importDefaultExperiencesToSupabase();
          if (importExpRes && importExpRes.count > 0) {
            currentExps = await fetchAllExperiencesAdmin();
          }
        } catch (importExpErr) {
          console.warn('Auto-import default experiences to database:', importExpErr);
        }
      }

      let currentCerts = certsData || [];
      // If database has fewer than 3 certifications, auto-import defaults
      if (currentCerts.length < 3) {
        try {
          const importCertRes = await importDefaultCertificationsToSupabase();
          if (importCertRes && importCertRes.count > 0) {
            currentCerts = await fetchAllCertificationsAdmin();
          }
        } catch (importCertErr) {
          console.warn('Auto-import default certifications to database:', importCertErr);
        }
      }

      setProjectsList(currentProjs);
      setExperiencesList(currentExps);
      setCertificationsList(currentCerts);
      setGuestMessages(msgsData || []);
      setRatingsInfo(ratingData || { average: '0.0', count: 0, ratings: [] });
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      showToast('Gagal memuat data dari database.');
    } finally {
      setProjectsLoading(false);
      setExperiencesLoading(false);
      setCertificationsLoading(false);
      setGuestLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Profile Save Handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileError('');

    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      setProfileError('Nama depan dan belakang wajib diisi.');
      return;
    }

    setProfileSaving(true);
    try {
      await updateSiteProfile(profileForm);
      await refreshSiteData();
      showToast('Profil berhasil disimpan!');
    } catch (err) {
      console.error('Save profile error:', err);
      setProfileError(err.message || 'Gagal menyimpan profil.');
      showToast('Gagal menyimpan profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Project Toggle Published
  const handleTogglePublish = async (proj) => {
    try {
      const updated = await toggleProjectPublished(proj.id, proj.published);
      setProjectsList((prev) =>
        prev.map((item) => (item.id === proj.id ? { ...item, published: updated.published } : item))
      );
      await refreshSiteData();
      showToast(updated.published ? 'Project ditampilkan di website' : 'Project disembunyikan (Draft)');
    } catch (err) {
      console.error('Toggle publish error:', err);
      showToast('Gagal mengubah status publikasi.');
    }
  };

  // Delete Project Handler
  const handleDeleteProject = async (proj) => {
    if (!window.confirm(`Hapus project "${proj.title}"?`)) return;

    try {
      const imgList = Array.isArray(proj.images) && proj.images.length > 0
        ? proj.images
        : (proj.image ? [proj.image] : []);

      await deleteProject(proj.id, imgList);
      setProjectsList((prev) => prev.filter((item) => item.id !== proj.id));
      await refreshSiteData();
      showToast('Project berhasil dihapus!');
    } catch (err) {
      console.error('Delete project error:', err);
      showToast(err.message || 'Gagal menghapus project.');
    }
  };

  // Open Project Modal - Add New
  const openNewProjectModal = () => {
    setEditingProject(null);
    setDeletedImagesOnEdit([]);
    setProjectForm({
      id: crypto.randomUUID(),
      year: new Date().getFullYear(),
      category: 'Web',
      title: '',
      description: '',
      problem_context: '',
      solution: '',
      highlightsText: '',
      tech: '',
      repo_url: '',
      demo_url: '',
      images: [],
      published: true,
    });
    setProjectModalError('');
    setModalOpen(true);
  };

  // Populate project form one-by-one from a default project preset
  const fillFromDefaultProject = (p) => {
    const imagesArr = p.images
      ? p.images.map((img) => (typeof img === 'string' ? img : img.src))
      : (p.image ? [p.image] : []);

    const hl = Array.isArray(p.features)
      ? p.features.join('\n')
      : (Array.isArray(p.highlights) ? p.highlights.join('\n') : '');

    setProjectForm((prev) => ({
      ...prev,
      title: p.title || '',
      category: p.category || 'Web',
      year: parseInt(p.year, 10) || 2026,
      description: p.description || '',
      problem_context: p.problem || p.overview || '',
      solution: p.solution || '',
      highlightsText: hl,
      tech: p.technologies ? p.technologies.join(', ') : (p.tech || ''),
      repo_url: p.links?.github || p.repo_url || '',
      demo_url: p.links?.demo || p.demo_url || '',
      images: imagesArr,
      published: true,
    }));
    setProjectModalError('');
    showToast(`Form diisi dengan data: ${p.title.split(' - ')[0]}`);
  };

  // Open Project Modal - Edit Existing
  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setDeletedImagesOnEdit([]);

    const imgList = Array.isArray(proj.images) && proj.images.length > 0
      ? [...proj.images]
      : (proj.image ? [proj.image] : []);

    const hl = Array.isArray(proj.highlights)
      ? proj.highlights.join('\n')
      : (Array.isArray(proj.features) ? proj.features.join('\n') : '');

    setProjectForm({
      id: proj.id,
      year: proj.year || (proj.created_at ? new Date(proj.created_at).getFullYear() : new Date().getFullYear()),
      category: proj.category || 'Web',
      title: proj.title || '',
      description: proj.description || '',
      problem_context: proj.problem_context || proj.problem || proj.overview || '',
      solution: proj.solution || '',
      highlightsText: hl,
      tech: proj.tech || (Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''),
      repo_url: proj.repo_url || proj.links?.github || '',
      demo_url: proj.demo_url || proj.links?.demo || '',
      images: imgList,
      published: proj.published !== undefined ? Boolean(proj.published) : true,
    });
    setProjectModalError('');
    setModalOpen(true);
  };

  // Handle uploading multiple image files (max 6, 2 MB each, image/* only)
  const handleImageFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setProjectModalError('');

    const currentCount = projectForm.images.length;
    if (currentCount >= 6) {
      setProjectModalError('Maksimal 6 gambar per project.');
      e.target.value = '';
      return;
    }

    if (currentCount + files.length > 6) {
      setProjectModalError(`Maksimal 6 gambar. Saat ini sudah ada ${currentCount} gambar (hanya dapat menambah ${6 - currentCount} lagi).`);
      e.target.value = '';
      return;
    }

    setProjectUploading(true);
    try {
      const projectId = projectForm.id || crypto.randomUUID();
      if (!projectForm.id) {
        setProjectForm((prev) => ({ ...prev, id: projectId }));
      }

      const { urls, errors } = await uploadProjectImages(files, projectId);

      if (errors.length > 0) {
        setProjectModalError(errors.join(' | '));
      }

      if (urls.length > 0) {
        setProjectForm((prev) => ({
          ...prev,
          images: [...prev.images, ...urls].slice(0, 6),
        }));
      }
    } catch (err) {
      console.error('Upload project images error:', err);
      setProjectModalError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setProjectUploading(false);
      e.target.value = '';
    }
  };

  // Set an image as cover (move to index 0)
  const handleSetCover = (index) => {
    if (index <= 0 || index >= projectForm.images.length) return;
    setProjectForm((prev) => {
      const copy = [...prev.images];
      const [moved] = copy.splice(index, 1);
      copy.unshift(moved);
      return { ...prev, images: copy };
    });
  };

  // Delete an image from projectForm (mark for deletion from storage on save)
  const handleDeleteImageFromProject = (index) => {
    setProjectForm((prev) => {
      const targetUrl = prev.images[index];
      if (targetUrl) {
        setDeletedImagesOnEdit((d) => [...d, targetUrl]);
      }
      const copy = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: copy };
    });
  };

  // Save Project (Create or Edit with expanded validation)
  const handleSaveProjectModal = async (e) => {
    e.preventDefault();
    setProjectModalError('');

    const title = projectForm.title.trim();
    if (!title) {
      setProjectModalError('Judul project wajib diisi.');
      return;
    }

    const yearNum = parseInt(projectForm.year, 10);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      setProjectModalError('Tahun harus antara 2000 dan 2100.');
      return;
    }

    if (projectForm.repo_url?.trim() && !/^https?:\/\//i.test(projectForm.repo_url.trim())) {
      setProjectModalError('Link GitHub repo harus diawali http:// atau https://');
      return;
    }

    if (projectForm.demo_url?.trim() && !/^https?:\/\//i.test(projectForm.demo_url.trim())) {
      setProjectModalError('Link demo harus diawali http:// atau https://');
      return;
    }

    const hl = projectForm.highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (hl.length > 10) {
      setProjectModalError('Maksimal 10 key highlights.');
      return;
    }

    setProjectUploading(true);
    try {
      const payload = {
        id: projectForm.id,
        title,
        description: projectForm.description.trim(),
        year: yearNum,
        category: projectForm.category || 'Web',
        problem_context: projectForm.problem_context.trim(),
        solution: projectForm.solution.trim(),
        highlights: hl,
        tech: projectForm.tech.trim(),
        repo_url: projectForm.repo_url.trim(),
        demo_url: projectForm.demo_url.trim(),
        images: projectForm.images,
        published: Boolean(projectForm.published),
      };

      if (editingProject) {
        const updated = await updateProject(
          editingProject.id,
          payload,
          deletedImagesOnEdit
        );
        setProjectsList((prev) =>
          prev.map((item) => (item.id === editingProject.id ? updated : item))
        );
        showToast('Project berhasil diperbarui!');
      } else {
        const created = await createProject(payload);
        setProjectsList((prev) => [created, ...prev]);
        showToast('Project baru berhasil ditambahkan!');
      }

      await refreshSiteData();
      setModalOpen(false);
    } catch (err) {
      console.error('Save project error:', err);
      setProjectModalError(err.message || 'Gagal menyimpan project.');
    } finally {
      setProjectUploading(false);
    }
  };

  // ================= EXPERIENCE HANDLERS =================
  const handleTogglePublishExp = async (exp) => {
    try {
      const updated = await toggleExperiencePublished(exp.id, exp.published);
      setExperiencesList((prev) =>
        prev.map((item) => (item.id === exp.id ? { ...item, published: updated.published } : item))
      );
      await refreshSiteData();
      showToast(updated.published ? 'Experience ditampilkan di website' : 'Experience disembunyikan (Draft)');
    } catch (err) {
      console.error('Toggle publish experience error:', err);
      showToast('Gagal mengubah status publikasi.');
    }
  };

  const handleDeleteExp = async (exp) => {
    if (!window.confirm(`Hapus experience "${exp.title}"?`)) return;

    try {
      await deleteExperience(exp.id, exp.images);
      setExperiencesList((prev) => prev.filter((item) => item.id !== exp.id));
      await refreshSiteData();
      showToast('Experience berhasil dihapus!');
    } catch (err) {
      console.error('Delete experience error:', err);
      showToast(err.message || 'Gagal menghapus experience.');
    }
  };

  const openNewExpModal = () => {
    setEditingExp(null);
    setDeletedExpImages([]);
    const now = new Date();
    const curYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setExpForm({
      id: crypto.randomUUID(),
      period: curYearMonth,
      title: '',
      organization: '',
      location: '',
      description: '',
      highlightsText: '',
      tech: '',
      images: [],
      published: true,
    });
    setExpModalError('');
    setExpModalOpen(true);
  };

  const openEditExpModal = (exp) => {
    setEditingExp(exp);
    setDeletedExpImages([]);

    let rawPeriod = '';
    if (exp.period) {
      rawPeriod = String(exp.period).slice(0, 7); // YYYY-MM
    }

    const hl = Array.isArray(exp.highlights)
      ? exp.highlights.join('\n')
      : '';

    setExpForm({
      id: exp.id,
      period: rawPeriod,
      title: exp.title || '',
      organization: exp.organization || '',
      location: exp.location || '',
      description: exp.description || '',
      highlightsText: hl,
      tech: exp.tech || '',
      images: Array.isArray(exp.images) ? [...exp.images] : [],
      published: exp.published !== undefined ? Boolean(exp.published) : true,
    });
    setExpModalError('');
    setExpModalOpen(true);
  };

  const handleImageFilesChangeExp = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setExpModalError('');

    const currentCount = expForm.images.length;
    if (currentCount >= 6) {
      setExpModalError('Maksimal 6 gambar per experience.');
      e.target.value = '';
      return;
    }

    if (currentCount + files.length > 6) {
      setExpModalError(`Maksimal 6 gambar. Saat ini sudah ada ${currentCount} gambar (hanya dapat menambah ${6 - currentCount} lagi).`);
      e.target.value = '';
      return;
    }

    setExpUploading(true);
    try {
      const expId = expForm.id || crypto.randomUUID();
      if (!expForm.id) {
        setExpForm((prev) => ({ ...prev, id: expId }));
      }

      const { urls, errors } = await uploadExperienceImages(files, expId);

      if (errors.length > 0) {
        setExpModalError(errors.join(' | '));
      }

      if (urls.length > 0) {
        setExpForm((prev) => ({
          ...prev,
          images: [...prev.images, ...urls].slice(0, 6),
        }));
      }
    } catch (err) {
      console.error('Upload experience images error:', err);
      setExpModalError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setExpUploading(false);
      e.target.value = '';
    }
  };

  const handleSetCoverExp = (index) => {
    if (index <= 0 || index >= expForm.images.length) return;
    setExpForm((prev) => {
      const copy = [...prev.images];
      const [moved] = copy.splice(index, 1);
      copy.unshift(moved);
      return { ...prev, images: copy };
    });
  };

  const handleDeleteImageFromExp = (index) => {
    setExpForm((prev) => {
      const targetUrl = prev.images[index];
      if (targetUrl) {
        setDeletedExpImages((d) => [...d, targetUrl]);
      }
      const copy = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: copy };
    });
  };

  const handleSaveExpModal = async (e) => {
    e.preventDefault();
    setExpModalError('');

    const title = expForm.title.trim();
    if (!title) {
      setExpModalError('Judul experience wajib diisi.');
      return;
    }

    if (!expForm.period) {
      setExpModalError('Bulan dan tahun periode wajib diisi.');
      return;
    }

    const hl = expForm.highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (hl.length > 10) {
      setExpModalError('Maksimal 10 key highlights.');
      return;
    }

    setExpUploading(true);
    try {
      // Normalize period to YYYY-MM-01
      const normalizedPeriod = expForm.period.length === 7 ? `${expForm.period}-01` : expForm.period;

      const payload = {
        id: expForm.id,
        period: normalizedPeriod,
        title,
        organization: expForm.organization.trim(),
        location: expForm.location.trim(),
        description: expForm.description.trim(),
        highlights: hl,
        tech: expForm.tech.trim(),
        images: expForm.images,
        published: Boolean(expForm.published),
      };

      if (editingExp) {
        const updated = await updateExperience(
          editingExp.id,
          payload,
          deletedExpImages
        );
        setExperiencesList((prev) =>
          prev
            .map((item) => (item.id === editingExp.id ? updated : item))
            .sort((a, b) => (b.period || '').localeCompare(a.period || ''))
        );
        showToast('Experience berhasil diperbarui!');
      } else {
        const created = await createExperience(payload);
        setExperiencesList((prev) =>
          [created, ...prev].sort((a, b) => (b.period || '').localeCompare(a.period || ''))
        );
        showToast('Experience baru berhasil ditambahkan!');
      }

      await refreshSiteData();
      setExpModalOpen(false);
    } catch (err) {
      console.error('Save experience error:', err);
      setExpModalError(err.message || 'Gagal menyimpan experience.');
    } finally {
      setExpUploading(false);
    }
  };

  // ================= CERTIFICATION HANDLERS =================
  const handleTogglePublishCert = async (cert) => {
    try {
      const updated = await toggleCertificationPublished(cert.id, cert.published);
      setCertificationsList((prev) =>
        prev.map((item) => (item.id === cert.id ? { ...item, published: updated.published } : item))
      );
      await refreshSiteData();
      showToast(updated.published ? 'Sertifikat ditampilkan di website' : 'Sertifikat disembunyikan (Draft)');
    } catch (err) {
      console.error('Toggle publish certification error:', err);
      showToast('Gagal mengubah status publikasi.');
    }
  };

  const handleDeleteCert = async (cert) => {
    if (!window.confirm(`Hapus sertifikat "${cert.title}"?`)) return;

    try {
      await deleteCertification(cert.id, cert.images);
      setCertificationsList((prev) => prev.filter((item) => item.id !== cert.id));
      await refreshSiteData();
      showToast('Sertifikat berhasil dihapus!');
    } catch (err) {
      console.error('Delete certification error:', err);
      showToast(err.message || 'Gagal menghapus sertifikat.');
    }
  };

  const openNewCertModal = () => {
    setEditingCert(null);
    setDeletedCertImages([]);
    const today = new Date().toISOString().slice(0, 10);
    setCertForm({
      id: crypto.randomUUID(),
      issued_on: today,
      title: '',
      issuer: '',
      description: '',
      credential_id: '',
      images: [],
      published: true,
    });
    setCertModalError('');
    setCertModalOpen(true);
  };

  const openEditCertModal = (cert) => {
    setEditingCert(cert);
    setDeletedCertImages([]);

    let rawDate = '';
    if (cert.issued_on) {
      rawDate = String(cert.issued_on).slice(0, 10); // YYYY-MM-DD
    }

    setCertForm({
      id: cert.id,
      issued_on: rawDate,
      title: cert.title || '',
      issuer: cert.issuer || '',
      description: cert.description || '',
      credential_id: cert.credential_id || '',
      images: Array.isArray(cert.images) ? [...cert.images] : [],
      published: cert.published !== undefined ? Boolean(cert.published) : true,
    });
    setCertModalError('');
    setCertModalOpen(true);
  };

  const handleImageFilesChangeCert = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCertModalError('');

    const currentCount = certForm.images.length;
    if (currentCount >= 6) {
      setCertModalError('Maksimal 6 gambar per sertifikat.');
      e.target.value = '';
      return;
    }

    if (currentCount + files.length > 6) {
      setCertModalError(`Maksimal 6 gambar. Saat ini sudah ada ${currentCount} gambar (hanya dapat menambah ${6 - currentCount} lagi).`);
      e.target.value = '';
      return;
    }

    setCertUploading(true);
    try {
      const certId = certForm.id || crypto.randomUUID();
      if (!certForm.id) {
        setCertForm((prev) => ({ ...prev, id: certId }));
      }

      const { urls, errors } = await uploadCertificationImages(files, certId);

      if (errors.length > 0) {
        setCertModalError(errors.join(' | '));
      }

      if (urls.length > 0) {
        setCertForm((prev) => ({
          ...prev,
          images: [...prev.images, ...urls].slice(0, 6),
        }));
      }
    } catch (err) {
      console.error('Upload certification images error:', err);
      setCertModalError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setCertUploading(false);
      e.target.value = '';
    }
  };

  const handleSetCoverCert = (index) => {
    if (index <= 0 || index >= certForm.images.length) return;
    setCertForm((prev) => {
      const copy = [...prev.images];
      const [moved] = copy.splice(index, 1);
      copy.unshift(moved);
      return { ...prev, images: copy };
    });
  };

  const handleDeleteImageFromCert = (index) => {
    setCertForm((prev) => {
      const targetUrl = prev.images[index];
      if (targetUrl) {
        setDeletedCertImages((d) => [...d, targetUrl]);
      }
      const copy = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: copy };
    });
  };

  const handleSaveCertModal = async (e) => {
    e.preventDefault();
    setCertModalError('');

    const title = certForm.title.trim();
    if (!title) {
      setCertModalError('Judul sertifikat wajib diisi.');
      return;
    }

    if (!certForm.issued_on) {
      setCertModalError('Tanggal terbit wajib diisi.');
      return;
    }

    setCertUploading(true);
    try {
      const payload = {
        id: certForm.id,
        issued_on: certForm.issued_on,
        title,
        issuer: certForm.issuer.trim(),
        description: certForm.description.trim(),
        credential_id: certForm.credential_id.trim(),
        images: certForm.images,
        published: Boolean(certForm.published),
      };

      if (editingCert) {
        const updated = await updateCertification(
          editingCert.id,
          payload,
          deletedCertImages
        );
        setCertificationsList((prev) =>
          prev
            .map((item) => (item.id === editingCert.id ? updated : item))
            .sort((a, b) => (b.issued_on || '').localeCompare(a.issued_on || ''))
        );
        showToast('Sertifikat berhasil diperbarui!');
      } else {
        const created = await createCertification(payload);
        setCertificationsList((prev) =>
          [created, ...prev].sort((a, b) => (b.issued_on || '').localeCompare(a.issued_on || ''))
        );
        showToast('Sertifikat baru berhasil ditambahkan!');
      }

      await refreshSiteData();
      setCertModalOpen(false);
    } catch (err) {
      console.error('Save certification error:', err);
      setCertModalError(err.message || 'Gagal menyimpan sertifikat.');
    } finally {
      setCertUploading(false);
    }
  };

  // Guestbook Delete Message
  const handleDeleteGuestMessage = async (msg) => {
    if (!window.confirm(`Hapus pesan dari "${msg.name}"?`)) return;

    try {
      await deleteAdminGuestbookMessage(msg.id);
      setGuestMessages((prev) => prev.filter((item) => item.id !== msg.id));
      showToast('Pesan berhasil dihapus!');
    } catch (err) {
      console.error('Delete message error:', err);
      showToast(err.message || 'Gagal menghapus pesan.');
    }
  };

  // Helper to split tags/tech chips
  const renderChips = (str) => {
    if (!str) return null;
    return str
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((chip, idx) => <span key={idx}>{chip}</span>);
  };

  const publishedCount = projectsList.filter((p) => p.published).length;

  return (
    <div className="lego-admin-scope">
      {/* Toast Notification */}
      <div className={`lego-admin-toast ${toastMsg ? 'on' : ''}`} role="status">
        {toastMsg}
      </div>

      <div className="shell">
        {/* Sidebar */}
        <aside>
          <div className="brand">
            <LegoLogo />
            <div>
              FADHIL
              <small>ADMIN</small>
            </div>
          </div>

          <button
            type="button"
            className={`nv ${view === 'home' ? 'on' : ''}`}
            onClick={() => {
              setView('home');
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="home" /> Ringkasan
          </button>
          <button
            type="button"
            className={`nv ${view === 'profile' ? 'on' : ''}`}
            onClick={() => {
              setView('profile');
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="user" /> Profil
          </button>
          <button
            type="button"
            className={`nv ${view === 'projects' ? 'on' : ''}`}
            onClick={() => {
              setView('projects');
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="proj" /> Project
          </button>
          <button
            type="button"
            className={`nv ${view === 'exp' ? 'on' : ''}`}
            onClick={() => {
              setView('exp');
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="exp" /> Experience
          </button>
          <button
            type="button"
            className={`nv ${view === 'cert' ? 'on' : ''}`}
            onClick={() => {
              setView('cert');
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="cert" /> Sertifikasi
          </button>
          <button
            type="button"
            className={`nv ${view === 'guest' ? 'on' : ''}`}
            onClick={() => {
              setView('guest');
              window.scrollTo(0, 0);
            }}
          >
            <Icon name="chat" /> Guestbook
          </button>

          <div className="sp" />

          <button
            type="button"
            className="nv"
            onClick={onNavigateHome}
            title="Lihat website publik"
          >
            <Icon name="external" /> Lihat Website
          </button>

          <button
            type="button"
            className="nv lo"
            onClick={onLogout}
            title="Keluar dari akun admin"
          >
            <Icon name="out" /> Keluar
          </button>
        </aside>

        {/* Main Content Area */}
        <main>
          {/* Header Bar */}
          <div className="ph">
            <div>
              <h1>
                {view === 'home' && 'Ringkasan'}
                {view === 'profile' && 'Profil'}
                {view === 'projects' && 'Project'}
                {view === 'exp' && 'Experience'}
                {view === 'cert' && 'Sertifikasi'}
                {view === 'guest' && 'Guestbook'}
              </h1>
              <p className="sub">
                {view === 'home' && 'Kelola isi websitemu tanpa menyentuh kode.'}
                {view === 'profile' && 'Teks yang tampil di bagian hero dan About.'}
                {view === 'projects' && 'Tambah, ubah, atau sembunyikan project.'}
                {view === 'exp' && 'Pengalaman, prestasi, dan kegiatan.'}
                {view === 'cert' && 'Sertifikat dan penghargaan yang kamu miliki.'}
                {view === 'guest' && 'Pantau pesan dan hapus yang tidak pantas.'}
              </p>
            </div>

            {view === 'projects' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn w"
                  onClick={handleImportDefaults}
                  disabled={importing}
                  title="Pulihkan dan masukkan 4 project bawaan ke database"
                >
                  {importing ? 'Memulihkan...' : 'Pulihkan 4 Project Bawaan'}
                </button>
                <button type="button" className="btn" onClick={openNewProjectModal}>
                  <Icon name="plus" /> Tambah project
                </button>
              </div>
            )}

            {view === 'exp' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn w"
                  onClick={handleImportDefaultExps}
                  disabled={importingExp}
                  title="Pulihkan dan masukkan data experience bawaan ke database"
                >
                  {importingExp ? 'Memulihkan...' : 'Pulihkan Experience Bawaan'}
                </button>
                <button type="button" className="btn" onClick={openNewExpModal}>
                  <Icon name="plus" /> Tambah experience
                </button>
              </div>
            )}

            {view === 'cert' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn w"
                  onClick={handleImportDefaultCerts}
                  disabled={importingCert}
                  title="Pulihkan dan masukkan 3 sertifikasi bawaan ke database"
                >
                  {importingCert ? 'Memulihkan...' : 'Pulihkan 3 Sertifikat Bawaan'}
                </button>
                <button type="button" className="btn" onClick={openNewCertModal}>
                  <Icon name="plus" /> Tambah sertifikat
                </button>
              </div>
            )}

            {view === 'profile' && (
              <button
                type="button"
                className="btn"
                onClick={handleSaveProfile}
                disabled={profileSaving}
              >
                <Icon name="save" /> {profileSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            )}
          </div>

          {/* VIEW: RINGKASAN */}
          {view === 'home' && (
            <div>
              {/* Stat Cards */}
              <div className="stats">
                <div className="stat" style={{ '--c': '#b3121a' }}>
                  <b>{projectsList.length}</b>
                  <span>Total project</span>
                </div>
                <div className="stat" style={{ '--c': '#1a9e4a' }}>
                  <b>{publishedCount}</b>
                  <span>Project tampil</span>
                </div>
                <div className="stat" style={{ '--c': '#1f4fb4' }}>
                  <b>{experiencesList.length}</b>
                  <span>Experience</span>
                </div>
                <div className="stat" style={{ '--c': '#ffd500' }}>
                  <b>{certificationsList.length}</b>
                  <span>Sertifikasi</span>
                </div>
                <div className="stat" style={{ '--c': '#1f4fb4' }}>
                  <b>{guestMessages.length}</b>
                  <span>Pesan guestbook</span>
                </div>
                <div className="stat" style={{ '--c': '#ffd500' }}>
                  <b>{ratingsInfo.average || '0.0'}</b>
                  <span>Rating rata-rata</span>
                </div>
              </div>

              {/* Two Column Summary */}
              <div className="two">
                {/* Recent Projects */}
                <div className="card">
                  <h2>
                    <span>Project terbaru</span>
                    <button
                      type="button"
                      className="btn w"
                      onClick={() => setView('projects')}
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    >
                      Lihat semua
                    </button>
                  </h2>

                  {projectsList.length === 0 ? (
                    <p className="empty">Belum ada project.</p>
                  ) : (
                    projectsList.slice(0, 3).map((p, idx) => {
                      const coverImg = (p.images && p.images.length > 0) ? p.images[0] : (p.image_url || p.image || null);
                      return (
                        <div className="row" key={p.id}>
                          <span className="th" style={{ background: COLORS[idx % COLORS.length] }}>
                            {coverImg ? (
                              <img src={coverImg} alt={p.title} loading="lazy" />
                            ) : (
                              (p.title || '?')[0].toUpperCase()
                            )}
                          </span>
                          <div className="tx">
                            <b title={p.title}>{p.title}</b>
                            <p title={p.description}>{p.description || 'Tidak ada deskripsi'}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Recent Guestbook Messages */}
                <div className="card">
                  <h2>
                    <span>Pesan terbaru</span>
                    <button
                      type="button"
                      className="btn w"
                      onClick={() => setView('guest')}
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    >
                      Kelola
                    </button>
                  </h2>

                  {guestMessages.length === 0 ? (
                    <p className="empty">Belum ada pesan.</p>
                  ) : (
                    guestMessages.slice(0, 3).map((m, idx) => (
                      <div className="row" key={m.id}>
                        <span className="av" style={{ background: COLORS[idx % COLORS.length] }}>
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.name} loading="lazy" />
                          ) : (
                            (m.name || '?')[0].toUpperCase()
                          )}
                        </span>
                        <div className="tx">
                          <b>
                            {m.name}{' '}
                            <span className="tg">
                              {(m.provider || 'web').toUpperCase()}
                            </span>
                          </b>
                          <p>{m.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PROFIL */}
          {view === 'profile' && (
            <div className="form">
              {/* Form Input Card */}
              <div className="card">
                <form onSubmit={handleSaveProfile}>
                  <div className="g2">
                    <div>
                      <label htmlFor="f1">Nama depan</label>
                      <input
                        id="f1"
                        maxLength={40}
                        value={profileForm.first_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, first_name: e.target.value })
                        }
                        placeholder="Contoh: FADHIL PRIYA"
                      />
                    </div>
                    <div>
                      <label htmlFor="f2">Nama belakang (merah)</label>
                      <input
                        id="f2"
                        maxLength={40}
                        value={profileForm.last_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, last_name: e.target.value })
                        }
                        placeholder="Contoh: HARITZMANDA"
                      />
                    </div>
                  </div>

                  <label htmlFor="f3">Teks status</label>
                  <input
                    id="f3"
                    maxLength={50}
                    value={profileForm.status}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, status: e.target.value })
                    }
                    placeholder="STATUS: READY TO BUILD"
                  />

                  <label htmlFor="f4">Deskripsi singkat (bio)</label>
                  <textarea
                    id="f4"
                    maxLength={500}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    placeholder="Deskripsi singkat tentang dirimu..."
                  />

                  <label htmlFor="f5">Tag (pisahkan dengan koma)</label>
                  <input
                    id="f5"
                    value={profileForm.tags}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, tags: e.target.value })
                    }
                    placeholder="Pelajar RPL, Young Developer, Software Enthusiast"
                  />

                  <label htmlFor="f6">Link CV</label>
                  <input
                    id="f6"
                    type="url"
                    value={profileForm.cv_url}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, cv_url: e.target.value })
                    }
                    placeholder="https://.../cv.pdf"
                  />

                  {profileError && (
                    <div className="er" role="alert">
                      {profileError}
                    </div>
                  )}

                  <div style={{ marginTop: '20px' }}>
                    <button
                      type="submit"
                      className="btn"
                      disabled={profileSaving}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Icon name="save" /> {profileSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Card */}
              <div className="card pvbox">
                <h2>Pratinjau</h2>
                <div id="pvw">
                  <span className="pv">{profileForm.status || 'STATUS: READY TO BUILD'}</span>
                  <div className="pvn">
                    {profileForm.first_name || 'FADHIL PRIYA'}{' '}
                    <span>{profileForm.last_name || 'HARITZMANDA'}</span>
                  </div>
                  <p>
                    {profileForm.bio ||
                      'Deskripsi singkat akan muncul di sini sesuai dengan input di sebelah kiri.'}
                  </p>
                  <div className="chips">
                    {renderChips(profileForm.tags || 'Pelajar RPL, Young Developer')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PROJECTS */}
          {view === 'projects' && (
            <div className="card">
              {projectsLoading ? (
                <p className="empty">Memuat daftar project...</p>
              ) : projectsList.length === 0 ? (
                <p className="empty">
                  Belum ada project. Klik tombol "+ Tambah project" di atas untuk membuat yang pertama.
                </p>
              ) : (
                projectsList.map((p, idx) => {
                  const coverImg = (p.images && p.images.length > 0) ? p.images[0] : (p.image_url || p.image || null);
                  return (
                    <div className="row" key={p.id}>
                      <span className="th" style={{ background: COLORS[idx % COLORS.length] }}>
                        {coverImg ? (
                          <img src={coverImg} alt={p.title} loading="lazy" />
                        ) : (
                          (p.title || '?')[0].toUpperCase()
                        )}
                      </span>
                      <div className="tx">
                        <b>
                          {p.title}
                          {p.year && (
                            <span className="tg" style={{ background: '#1f4fb4' }}>
                              {p.year} · {(p.category || 'Web').toUpperCase()}
                            </span>
                          )}
                          {!p.published && <span className="tg">DRAFT</span>}
                        </b>
                        <p>{p.description || 'Tidak ada deskripsi'}</p>
                        <div className="chips">{renderChips(p.tech)}</div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        className="sw"
                        role="switch"
                        aria-checked={p.published}
                        onClick={() => handleTogglePublish(p)}
                        title={p.published ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                      >
                        <i />
                        {p.published ? 'Tampil' : 'Draft'}
                      </button>

                      {/* Actions */}
                      <div className="acts">
                        <button
                          type="button"
                          className="ib"
                          onClick={() => openEditProjectModal(p)}
                          aria-label={`Edit ${p.title}`}
                          title="Edit Project"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="ib d"
                          onClick={() => handleDeleteProject(p)}
                          aria-label={`Hapus ${p.title}`}
                          title="Hapus Project"
                        >
                          <Icon name="del" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW: EXPERIENCE */}
          {view === 'exp' && (
            <div className="card">
              {experiencesLoading ? (
                <p className="empty">Memuat daftar experience...</p>
              ) : experiencesList.length === 0 ? (
                <p className="empty">
                  Belum ada data experience. Klik tombol "+ Tambah experience" di atas untuk membuat yang pertama.
                </p>
              ) : (
                experiencesList.map((x, idx) => {
                  const coverImg = x.images && x.images.length > 0 ? x.images[0] : null;
                  return (
                    <div className="row" key={x.id}>
                      <span
                        className="th"
                        style={{
                          background: COLORS[idx % COLORS.length],
                          padding: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={x.title}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          (x.title || '?')[0].toUpperCase()
                        )}
                      </span>
                      <div className="tx">
                        <b>
                          {x.title}
                          {!x.published && <span className="tg">DRAFT</span>}
                        </b>
                        <p>
                          {formatExperiencePeriod(x.period)} · {x.organization || 'Tanpa Penyelenggara'}
                        </p>
                        <div className="chips">{renderChips(x.tech)}</div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        className="sw"
                        role="switch"
                        aria-checked={x.published}
                        onClick={() => handleTogglePublishExp(x)}
                        title={x.published ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                      >
                        <i />
                        {x.published ? 'Tampil' : 'Draft'}
                      </button>

                      {/* Actions */}
                      <div className="acts">
                        <button
                          type="button"
                          className="ib"
                          onClick={() => openEditExpModal(x)}
                          aria-label={`Edit ${x.title}`}
                          title="Edit Experience"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="ib d"
                          onClick={() => handleDeleteExp(x)}
                          aria-label={`Hapus ${x.title}`}
                          title="Hapus Experience"
                        >
                          <Icon name="del" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW: SERTIFIKASI */}
          {view === 'cert' && (
            <div className="card">
              {certificationsLoading ? (
                <p className="empty">Memuat daftar sertifikasi...</p>
              ) : certificationsList.length === 0 ? (
                <p className="empty">
                  Belum ada data sertifikat. Klik tombol "+ Tambah sertifikat" di atas untuk membuat yang pertama.
                </p>
              ) : (
                certificationsList.map((x, idx) => {
                  const coverImg = x.images && x.images.length > 0 ? x.images[0] : null;
                  return (
                    <div className="row" key={x.id}>
                      <span
                        className="th"
                        style={{
                          background: COLORS[idx % COLORS.length],
                          padding: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={x.title}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          (x.title || '?')[0].toUpperCase()
                        )}
                      </span>
                      <div className="tx">
                        <b>
                          {x.title}
                          {!x.published && <span className="tg">DRAFT</span>}
                        </b>
                        <p>
                          {formatCertificationDate(x.issued_on)} · {x.issuer || 'Tanpa Penerbit'}
                        </p>
                        {x.credential_id && (
                          <div className="chips">
                            <span>ID: {x.credential_id}</span>
                          </div>
                        )}
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        className="sw"
                        role="switch"
                        aria-checked={x.published}
                        onClick={() => handleTogglePublishCert(x)}
                        title={x.published ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                      >
                        <i />
                        {x.published ? 'Tampil' : 'Draft'}
                      </button>

                      {/* Actions */}
                      <div className="acts">
                        <button
                          type="button"
                          className="ib"
                          onClick={() => openEditCertModal(x)}
                          aria-label={`Edit ${x.title}`}
                          title="Edit Sertifikat"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="ib d"
                          onClick={() => handleDeleteCert(x)}
                          aria-label={`Hapus ${x.title}`}
                          title="Hapus Sertifikat"
                        >
                          <Icon name="del" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW: GUESTBOOK */}
          {view === 'guest' && (
            <div>
              {/* Rating Summary Card */}
              <div className="card">
                <div className="avg">
                  <b>{ratingsInfo.average || '0.0'}</b>
                  <span className="star" aria-hidden="true">
                    ★
                  </span>
                  <span>dari {ratingsInfo.count || 0} pemberi rating</span>
                </div>
              </div>

              {/* Guestbook Messages Card */}
              <div className="card">
                {guestLoading ? (
                  <p className="empty">Memuat pesan guestbook...</p>
                ) : guestMessages.length === 0 ? (
                  <p className="empty">Belum ada pesan di guestbook.</p>
                ) : (
                  guestMessages.map((m, idx) => (
                    <div className="row" key={m.id}>
                      <span className="av" style={{ background: COLORS[idx % COLORS.length] }}>
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.name} loading="lazy" />
                        ) : (
                          (m.name || '?')[0].toUpperCase()
                        )}
                      </span>
                      <div className="tx">
                        <b>
                          {m.name}{' '}
                          <span className="tg">
                            {(m.provider || 'web').toUpperCase()}
                          </span>
                        </b>
                        <p style={{ whiteSpace: 'normal' }}>{m.message}</p>
                        {m.created_at && (
                          <small style={{ color: '#888', fontSize: '0.75rem' }}>
                            {new Date(m.created_at).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </small>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ib d"
                        onClick={() => handleDeleteGuestMessage(m)}
                        aria-label={`Hapus pesan dari ${m.name}`}
                        title="Hapus pesan"
                      >
                        <Icon name="del" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Project Modal Dialog (Add / Edit) - Expanded Schema matching admin-v2.html */}
      {modalOpen && (
        <div className="lego-modal-overlay" onClick={() => !projectUploading && setModalOpen(false)}>
          <div
            className="lego-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{editingProject ? 'Edit project' : 'Project baru'}</h2>

            {!editingProject && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: 'var(--adm-soft)',
                  border: '2px dashed var(--adm-ink)',
                  borderRadius: '9px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  💡 Isi otomatis dari 4 project bawaan:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {defaultProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="btn w"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '7px' }}
                      onClick={() => fillFromDefaultProject(p)}
                      title={`Isi form dengan data ${p.title}`}
                    >
                      {p.title.split(' - ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveProjectModal}>
              <div className="g2">
                <div>
                  <label htmlFor="p0">Tahun *</label>
                  <input
                    id="p0"
                    type="number"
                    min="2000"
                    max="2100"
                    required
                    value={projectForm.year}
                    onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="pc">Kategori *</label>
                  <select
                    id="pc"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label htmlFor="p1">Judul *</label>
              <input
                id="p1"
                maxLength={80}
                required
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Judul project"
                autoFocus
              />

              <label htmlFor="p2">Deskripsi singkat (tampil di kartu)</label>
              <textarea
                id="p2"
                maxLength={300}
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Penjelasan ringkas tentang project untuk kartu depan..."
              />

              <label htmlFor="pp">Problem context</label>
              <textarea
                id="pp"
                maxLength={600}
                value={projectForm.problem_context}
                onChange={(e) => setProjectForm({ ...projectForm, problem_context: e.target.value })}
                placeholder="Latar belakang masalah atau tantangan yang dihadapi..."
              />

              <label htmlFor="ps">Engineered solution</label>
              <textarea
                id="ps"
                maxLength={600}
                value={projectForm.solution}
                onChange={(e) => setProjectForm({ ...projectForm, solution: e.target.value })}
                placeholder="Solusi teknis dan rekayasa yang dikembangkan..."
              />

              <label htmlFor="p8">Key highlights (satu poin per baris, maksimal 10)</label>
              <textarea
                id="p8"
                rows={5}
                value={projectForm.highlightsText}
                onChange={(e) => setProjectForm({ ...projectForm, highlightsText: e.target.value })}
                placeholder="Poin fitur utama 1&#10;Poin fitur utama 2&#10;Poin fitur utama 3"
              />

              <label htmlFor="p3">Technologies (pisahkan dengan koma)</label>
              <input
                id="p3"
                value={projectForm.tech}
                onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                placeholder="React.js, Tailwind CSS, Supabase"
              />

              <div className="g2 g2-spaced" style={{ marginTop: '16px' }}>
                <div>
                  <label htmlFor="p5">GitHub repo (diawali https://)</label>
                  <input
                    id="p5"
                    type="url"
                    value={projectForm.repo_url}
                    onChange={(e) => setProjectForm({ ...projectForm, repo_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="p4">Link demo (opsional)</label>
                  <input
                    id="p4"
                    type="url"
                    value={projectForm.demo_url}
                    onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <label htmlFor="p9">
                Gambar ({projectForm.images.length}/6)
              </label>
              <input
                id="p9"
                type="file"
                accept="image/*"
                multiple
                disabled={projectUploading || projectForm.images.length >= 6}
                onChange={handleImageFilesChange}
              />
              <p className="note">
                Maksimal 6 gambar, 2 MB per gambar. Gambar pertama otomatis jadi COVER. Klik tombol ★ untuk mengubah gambar cover.
              </p>

              {/* Multiple Images Grid */}
              {projectForm.images.length > 0 && (
                <div className="igrid">
                  {projectForm.images.map((src, i) => (
                    <div className="im" key={src || i}>
                      <img src={src} alt={`Gambar ${i + 1}`} loading="lazy" />
                      {i === 0 && <span className="cv">COVER</span>}
                      <div className="ia">
                        {i > 0 && (
                          <button
                            type="button"
                            className="ib"
                            onClick={() => handleSetCover(i)}
                            title={`Jadikan gambar ${i + 1} sebagai cover`}
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          className="ib d"
                          onClick={() => handleDeleteImageFromProject(i)}
                          title={`Hapus gambar ${i + 1}`}
                        >
                          <Icon name="del" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label htmlFor="p7">Status Publikasi</label>
              <select
                id="p7"
                value={projectForm.published ? '1' : '0'}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, published: e.target.value === '1' })
                }
              >
                <option value="1">Tampil di website</option>
                <option value="0">Draft (disembunyikan)</option>
              </select>

              {projectModalError && (
                <div className="er" role="alert">
                  {projectModalError}
                </div>
              )}

              <div className="acts" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn" disabled={projectUploading}>
                  <Icon name="save" /> {projectUploading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="btn w"
                  onClick={() => setModalOpen(false)}
                  disabled={projectUploading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Experience Modal Dialog (Add / Edit) - Matching admin-v3.html */}
      {expModalOpen && (
        <div className="lego-modal-overlay" onClick={() => !expUploading && setExpModalOpen(false)}>
          <div
            className="lego-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{editingExp ? 'Edit experience' : 'Tambah experience'}</h2>

            {!editingExp && defaultExperiencesData.length > 0 && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: 'var(--adm-soft)',
                  border: '2px dashed var(--adm-ink)',
                  borderRadius: '9px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  💡 Isi otomatis dari experience bawaan:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {defaultExperiencesData.map((exp, idx) => {
                    const expTitle = exp.title || exp.role || 'Experience';
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="btn w"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '7px' }}
                        onClick={() => {
                          const periodMap = {
                            'exp-lks-cyber': '2026-02',
                            'exp-jagoan-hosting': '2026-02',
                            'exp-jambore-provinsi': '2026-03',
                            'exp-jambore-kabupaten': '2026-01',
                            'exp-ozeva-coding': '2026-02',
                          };
                          const rawPeriod = periodMap[exp.id] || (exp.period && /^\d{4}-\d{2}/.test(exp.period) ? exp.period.slice(0, 7) : '2026-02');
                          const hl = Array.isArray(exp.highlights)
                            ? exp.highlights.join('\n')
                            : (Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : '');
                          const techStr = exp.tech || (Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '');
                          const imgs = Array.isArray(exp.images)
                            ? exp.images.map((img) => (typeof img === 'string' ? img : img.src))
                            : [];
                          setExpForm((prev) => ({
                            ...prev,
                            period: rawPeriod,
                            title: expTitle,
                            organization: exp.organization || exp.company || '',
                            location: exp.location || '',
                            description: exp.description || '',
                            highlightsText: hl,
                            tech: techStr,
                            images: imgs,
                            published: true,
                          }));
                          showToast(`Form diisi dengan data: ${expTitle.split(' - ')[0]}`);
                        }}
                        title={`Isi form dengan data ${expTitle}`}
                      >
                        {expTitle.split(' - ')[0] || expTitle}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveExpModal}>
              <label htmlFor="q0">Bulan dan tahun *</label>
              <input
                id="q0"
                type="month"
                required
                value={expForm.period}
                onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
              />

              <label htmlFor="q1">Judul *</label>
              <input
                id="q1"
                maxLength={120}
                required
                value={expForm.title}
                onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                placeholder="Contoh: Juara II - LKS Cyber Security 2026"
                autoFocus
              />

              <label htmlFor="q2">Penyelenggara / lembaga</label>
              <input
                id="q2"
                maxLength={120}
                value={expForm.organization}
                onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                placeholder="Contoh: LKS SMK Tingkat Kabupaten"
              />

              <label htmlFor="q3">Lokasi</label>
              <input
                id="q3"
                maxLength={80}
                value={expForm.location}
                onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                placeholder="Contoh: Karanganyar, Jawa Tengah"
              />

              <label htmlFor="q4">Deskripsi</label>
              <textarea
                id="q4"
                maxLength={700}
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                placeholder="Penjelasan tentang pengalaman atau kegiatan ini..."
              />

              <label htmlFor="q5">Key highlights (satu poin per baris, maksimal 10)</label>
              <textarea
                id="q5"
                rows={5}
                value={expForm.highlightsText}
                onChange={(e) => setExpForm({ ...expForm, highlightsText: e.target.value })}
                placeholder="Poin penting 1&#10;Poin penting 2&#10;Poin penting 3"
              />

              <label htmlFor="q6">Technologies (pisahkan dengan koma)</label>
              <input
                id="q6"
                value={expForm.tech}
                onChange={(e) => setExpForm({ ...expForm, tech: e.target.value })}
                placeholder="Cyber Security, Network Defense, Linux"
              />

              <label htmlFor="exp-imgs">
                Gambar ({expForm.images.length}/6)
              </label>
              <input
                id="exp-imgs"
                type="file"
                accept="image/*"
                multiple
                disabled={expUploading || expForm.images.length >= 6}
                onChange={handleImageFilesChangeExp}
              />
              <p className="note">
                Maksimal 6 gambar, 2 MB per gambar. Gambar pertama otomatis jadi COVER. Klik ★ untuk mengubah cover.
              </p>

              {/* Experience Images Grid */}
              {expForm.images.length > 0 && (
                <div className="igrid">
                  {expForm.images.map((src, i) => (
                    <div className="im" key={src || i}>
                      <img src={src} alt={`Gambar ${i + 1}`} loading="lazy" />
                      {i === 0 && <span className="cv">COVER</span>}
                      <div className="ia">
                        {i > 0 && (
                          <button
                            type="button"
                            className="ib"
                            onClick={() => handleSetCoverExp(i)}
                            title={`Jadikan gambar ${i + 1} sebagai cover`}
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          className="ib d"
                          onClick={() => handleDeleteImageFromExp(i)}
                          title={`Hapus gambar ${i + 1}`}
                        >
                          <Icon name="del" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label htmlFor="q8">Status Publikasi</label>
              <select
                id="q8"
                value={expForm.published ? '1' : '0'}
                onChange={(e) =>
                  setExpForm({ ...expForm, published: e.target.value === '1' })
                }
              >
                <option value="1">Tampil di website</option>
                <option value="0">Draft (disembunyikan)</option>
              </select>

              {expModalError && (
                <div className="er" role="alert">
                  {expModalError}
                </div>
              )}

              <div className="acts" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn" disabled={expUploading}>
                  <Icon name="save" /> {expUploading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="btn w"
                  onClick={() => setExpModalOpen(false)}
                  disabled={expUploading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal Dialog (Add / Edit) - Matching admin-v3.html */}
      {certModalOpen && (
        <div className="lego-modal-overlay" onClick={() => !certUploading && setCertModalOpen(false)}>
          <div
            className="lego-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{editingCert ? 'Edit sertifikat' : 'Tambah sertifikat'}</h2>

            {!editingCert && defaultCertificationsData.length > 0 && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: 'var(--adm-soft)',
                  border: '2px dashed var(--adm-ink)',
                  borderRadius: '9px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  💡 Isi otomatis dari sertifikasi bawaan:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {defaultCertificationsData.map((c, idx) => {
                    const certTitle = c.title || c.name || 'Sertifikat';
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="btn w"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '7px' }}
                        onClick={() => {
                          const dateMap = {
                            'cert-lks': '2026-02-18',
                            'cert-jambore-kabupaten': '2026-01-15',
                            'cert-ozeva': '2026-05-09',
                          };
                          const rawDate = dateMap[c.id] || (c.issued_on && /^\d{4}-\d{2}-\d{2}/.test(c.issued_on) ? c.issued_on : '2026-01-01');
                          const imgs = Array.isArray(c.images)
                            ? c.images.map((img) => (typeof img === 'string' ? img : img.src))
                            : [];
                          setCertForm((prev) => ({
                            ...prev,
                            issued_on: rawDate,
                            title: certTitle,
                            issuer: c.issuer || '',
                            description: c.description || '',
                            credential_id: c.credential_id || c.credentialId || '',
                            images: imgs,
                            published: true,
                          }));
                          showToast(`Form diisi dengan data: ${certTitle.split(' - ')[0]}`);
                        }}
                        title={`Isi form dengan data ${certTitle}`}
                      >
                        {certTitle.split(' - ')[0] || certTitle}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCertModal}>
              <label htmlFor="c0">Tanggal terbit *</label>
              <input
                id="c0"
                type="date"
                required
                value={certForm.issued_on}
                onChange={(e) => setCertForm({ ...certForm, issued_on: e.target.value })}
              />

              <label htmlFor="c1">Judul *</label>
              <input
                id="c1"
                maxLength={120}
                required
                value={certForm.title}
                onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                placeholder="Contoh: Sertifikat Juara II LKS Cyber Security 2026"
                autoFocus
              />

              <label htmlFor="c2">Penerbit</label>
              <input
                id="c2"
                maxLength={120}
                value={certForm.issuer}
                onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                placeholder="Contoh: Dinas Pendidikan Wilayah VI Prov. Jawa Tengah"
              />

              <label htmlFor="c4">Deskripsi</label>
              <textarea
                id="c4"
                maxLength={700}
                value={certForm.description}
                onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                placeholder="Penjelasan penghargaan atau kredensial ini..."
              />

              <label htmlFor="c7">Credential ID</label>
              <input
                id="c7"
                maxLength={80}
                value={certForm.credential_id}
                onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                placeholder="Contoh: 400.3.8.6/75/2026"
              />

              <label htmlFor="cert-imgs">
                Gambar ({certForm.images.length}/6)
              </label>
              <input
                id="cert-imgs"
                type="file"
                accept="image/*"
                multiple
                disabled={certUploading || certForm.images.length >= 6}
                onChange={handleImageFilesChangeCert}
              />
              <p className="note">
                Maksimal 6 gambar, 2 MB per gambar. Gambar pertama otomatis jadi COVER. Klik ★ untuk mengubah cover.
              </p>

              {/* Certification Images Grid */}
              {certForm.images.length > 0 && (
                <div className="igrid">
                  {certForm.images.map((src, i) => (
                    <div className="im" key={src || i}>
                      <img src={src} alt={`Gambar ${i + 1}`} loading="lazy" />
                      {i === 0 && <span className="cv">COVER</span>}
                      <div className="ia">
                        {i > 0 && (
                          <button
                            type="button"
                            className="ib"
                            onClick={() => handleSetCoverCert(i)}
                            title={`Jadikan gambar ${i + 1} sebagai cover`}
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          className="ib d"
                          onClick={() => handleDeleteImageFromCert(i)}
                          title={`Hapus gambar ${i + 1}`}
                        >
                          <Icon name="del" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label htmlFor="c8">Status Publikasi</label>
              <select
                id="c8"
                value={certForm.published ? '1' : '0'}
                onChange={(e) =>
                  setCertForm({ ...certForm, published: e.target.value === '1' })
                }
              >
                <option value="1">Tampil di website</option>
                <option value="0">Draft (disembunyikan)</option>
              </select>

              {certModalError && (
                <div className="er" role="alert">
                  {certModalError}
                </div>
              )}

              <div className="acts" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn" disabled={certUploading}>
                  <Icon name="save" /> {certUploading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="btn w"
                  onClick={() => setCertModalOpen(false)}
                  disabled={certUploading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
