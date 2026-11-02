import React, { useEffect, useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { useSiteData } from '../context/SiteContext';

export default function ResumeModal({ isOpen, onClose }) {
  const [viewMode, setViewMode] = useState('doc'); // 'doc' or 'pdf'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
      if (window.lenis) window.lenis.stop();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { siteProfile } = useSiteData();
  const cvUrl = siteProfile?.cv_url || personalInfo.cv || '/cv/CV_Fadhil_Priya_Haritzmanda.pdf';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-[100] bg-on-background/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:fixed print:inset-0"
    >
      <div className="fixed inset-0 print:hidden" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl h-[92vh] bg-surface border-4 border-on-surface brick-shadow rounded-2xl flex flex-col overflow-hidden my-auto print:border-none print:shadow-none print:h-auto print:rounded-none">
        {/* Top 3 Lego Studs */}
        <div className="absolute -top-2.5 left-12 flex gap-4 pointer-events-none z-20 print:hidden">
          <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface shadow-sm" />
          <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface shadow-sm" />
          <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface shadow-sm" />
        </div>

        {/* Modal Header */}
        <div className="bg-surface-container-high border-b-4 border-on-surface px-4 md:px-6 py-3 flex items-center justify-between select-none print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-on-surface hover:opacity-80 transition-opacity cursor-pointer"
                title="Close"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface" />
              <span className="w-3.5 h-3.5 rounded-full bg-brick-blue border-2 border-on-surface" />
            </div>
            <span className="font-label-caps text-[11px] md:text-xs font-bold text-on-surface tracking-wider truncate max-w-[200px] sm:max-w-none">
              CV_VIEWER // {personalInfo.name.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center border-2 border-on-surface bg-white text-[10px] sm:text-xs font-label-caps font-bold">
              <button
                type="button"
                onClick={() => setViewMode('doc')}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  viewMode === 'doc' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                DOCUMENT (WORD)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  viewMode === 'pdf' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                PDF VIEW
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 border-2 border-on-surface bg-white hover:bg-primary hover:text-white flex items-center justify-center transition-colors font-bold text-sm brick-shadow cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Main Content Workspace */}
        <div
          data-lenis-prevent="true"
          className="flex-1 w-full h-full bg-[#525659] relative overflow-y-auto overflow-x-hidden flex flex-col items-center p-3 sm:p-6 print:p-0 print:bg-white"
        >
          {viewMode === 'pdf' ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <iframe
                src={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none bg-white rounded shadow-md"
                title={`CV ${personalInfo.name}`}
              />
            </div>
          ) : (
            /* Word Document Page Sheet (A4 format ATS Resume) */
            <div className="w-full max-w-3xl bg-white text-[#1f2937] p-6 sm:p-10 md:p-14 shadow-2xl rounded-sm border border-gray-300 font-sans my-auto select-text print:shadow-none print:border-none print:p-0 print:max-w-none print:my-0">
              {/* Document Header */}
              <div className="text-center border-b-2 border-gray-800 pb-5 mb-5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-gray-900 uppercase mb-2">
                  Fadhil Priya Haritzmanda
                </h1>
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-gray-600 font-medium">
                  <a href="tel:+62882003676365" className="hover:text-primary transition-colors">
                    +62 882 0036 76365
                  </a>
                  <span>•</span>
                  <a href="mailto:fadhilpriyaharitzmanda@gmail.com" className="hover:text-primary transition-colors">
                    fadhilpriyaharitzmanda@gmail.com
                  </a>
                  <span>•</span>
                  <a href="https://fadhilharitzmanda.vercel.app" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                    fadhilharitzmanda.vercel.app
                  </a>
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1">
                  Karanganyar, Jawa Tengah, Indonesia
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify">
                  Pelajar Rekayasa Perangkat Lunak (RPL) di SMK Negeri 2 Karanganyar dengan ketertarikan mendalam terhadap perkembangan teknologi informasi, terutama di bidang software development dan website development. Memiliki pengalaman lebih dari 1 tahun dalam mendalami pemrograman serta aktif berpartisipasi dalam kompetisi teknologi, termasuk Juara II LKS Cyber Security Tingkat Kabupaten Karanganyar 2026 dan Juara 1 Lomba Piranti Lunak Jambore Pemuda Karanganyar 2026. Bersemangat untuk terus belajar dan menciptakan solusi digital yang bermanfaat.
                </p>
              </div>

              {/* Section: Pengalaman */}
              <div className="mb-6">
                <h2 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase border-b-2 border-primary pb-1 mb-3">
                  PENGALAMAN
                </h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        LKS SMK Tingkat Kabupaten Karanganyar
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        Feb 2026
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-1">
                      Juara II – LKS Cyber Security Tingkat Kabupaten 2026
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Meraih Juara II pada Seleksi Lomba Keterampilan Siswa (LKS) Tingkat Kabupaten Karanganyar Tahun 2026 pada Mata Lomba Teknologi Keamanan Siber (Cyber Security), yang menguji analisis pertahanan jaringan dan mitigasi insiden siber.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Jagoan Hosting Indonesia
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2026
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-1">
                      Peserta – Lomba Jagoan Hosting 2.0
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Berpartisipasi dalam kompetisi pengembangan dan deployment web nasional Jagoan Hosting Innovation Competition 2026, berfokus pada kecepatan akses, performa server, dan implementasi arsitektur website modern.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Jambore Pemuda Provinsi Jawa Tengah
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2026
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-1">
                      Kontingen / Delegasi – Jambore Pemuda Tingkat Provinsi
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Terpilih mewakili Kabupaten Karanganyar dalam ajang Jambore Pemuda tingkat Provinsi Jawa Tengah 2026, mengasah kepemimpinan, kolaborasi antarwilayah, dan kreativitas inovasi generasi muda.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Jambore Pemuda Karanganyar
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2026
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-1">
                      Peserta – Jambore Pemuda Tingkat Kabupaten
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Mengikuti Jambore Pemuda tingkat Kabupaten Karanganyar Tahun 2026, sebuah ajang pembinaan karakter, kerja sama tim, dan kepemimpinan pemuda serta kompetisi TIK bidang piranti lunak.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Ozeva Vali Coding
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        Feb – Mei 2026
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-1">
                      Peserta Bootcamp – Training Coding Kelas Rookie (Beginner)
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Mengikuti program bootcamp intensif untuk memperdalam pemahaman logika pemrograman, pemecahan masalah algoritma, dan dasar-dasar rekayasa perangkat lunak.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Pendidikan */}
              <div className="mb-6">
                <h2 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase border-b-2 border-primary pb-1 mb-3">
                  PENDIDIKAN
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        SMK Negeri 2 Karanganyar – Karanganyar
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2025 – Sekarang
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-0.5">
                      Rekayasa Perangkat Lunak (RPL)
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Sedang menempuh pendidikan kejuruan di bidang Rekayasa Perangkat Lunak (RPL) dengan fokus pada software engineering, pengembangan website, dan keamanan sistem informasi.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        SMP Negeri 5 Karanganyar – Karanganyar
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2022 – 2025
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-0.5">
                      Sekolah Menengah Pertama (SMP)
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Menyelesaikan pendidikan tingkat menengah pertama dengan aktif mengasah minat di bidang teknologi, kepemimpinan, dan kegiatan kepemudaan.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        SDN 03 Suruhkalang – Karanganyar
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2015 – 2021
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-0.5">
                      Sekolah Dasar (SD)
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Menyelesaikan pendidikan dasar selama 6 tahun dengan fondasi akademik dan pembentukan karakter disiplin.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        TK Global Prima Study – Karanganyar
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2013 – 2015
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d4ed8] italic mb-0.5">
                      Pendidikan Anak Usia Dini (PAUD / TK)
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Awal perjalanan pendidikan anak usia dini yang membangun rasa ingin tahu, sosialisasi, dan kreativitas dasar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Lisensi & Sertifikasi */}
              <div className="mb-6">
                <h2 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase border-b-2 border-primary pb-1 mb-3">
                  LISENSI & SERTIFIKASI
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Sertifikat Juara II LKS Cyber Security 2026
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        18 Feb 2026
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500 italic mb-0.5">
                      Dinas Pendidikan Wilayah VI Prov. Jawa Tengah | ID: 400.3.8.6/75/2026
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Sertifikat resmi penghargaan atas prestasi meraih Juara II Mata Lomba Teknologi Keamanan Siber (Cyber Security) pada Seleksi LKS Tingkat Kabupaten Karanganyar Tahun 2026.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Piagam Juara 1 Lomba Piranti Lunak Jambore Pemuda
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        2026
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500 italic mb-0.5">
                      Pemerintah Kabupaten Karanganyar | ID: JAMBORE-PL-2026
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Piagam penghargaan Juara 1 Kategori Lomba Piranti Lunak pada Kegiatan Jambore Pemuda Kabupaten Karanganyar Tahun 2026.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Sertifikat Training Coding Kelas Rookie (Beginner)
                      </h3>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        09 Mei 2026
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500 italic mb-0.5">
                      Vali Coding | ID: P20260002
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Sertifikat kelulusan atas partisipasi aktif dalam program Training Coding Kelas Rookie (Beginner) periode 21 Februari 2026 – 09 Mei 2026 oleh Principal Instructor Tan Gay O, MSc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Proyek */}
              <div className="mb-6">
                <h2 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase border-b-2 border-primary pb-1 mb-3">
                  PROYEK
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 list-disc list-inside text-xs text-gray-700">
                  <li>Website Absensi Kelas</li>
                  <li>Website Kas Buku Digital</li>
                  <li>Website Freelance JembatanKarya</li>
                  <li>Website E-Learning</li>
                  <li>Website CMS (Content Management System)</li>
                  <li>Website Sistem Informasi Sekolah</li>
                  <li>Website Kasir Digital</li>
                </ul>
              </div>

              {/* Section: Keahlian */}
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase border-b-2 border-primary pb-1 mb-3">
                  KEAHLIAN
                </h2>
                <div className="flex flex-col gap-1.5 text-xs text-gray-700">
                  <div>
                    <span className="font-bold text-gray-900">UI/UX Design: </span>
                    <span>Figma, Photoshop, Canva, Capcut</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Bahasa Pemrograman: </span>
                    <span>HTML, CSS, JavaScript, PHP, SQL, Java, C#</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Soft Skills: </span>
                    <span>Public Speaking, Kepemimpinan, Kerja Sama Tim, Pemecahan Masalah, Cepat Belajar</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-surface border-t-4 border-on-surface px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 select-none print:hidden">
          <div className="font-label-caps text-[10px] md:text-xs text-on-surface-variant font-bold uppercase">
            CURRICULUM VITAE // PROFESSIONAL RESUME
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white text-on-surface border-2 border-on-surface font-button-text text-xs uppercase brick-shadow hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>PRINT</span>
            </button>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white text-on-surface border-2 border-on-surface font-button-text text-xs uppercase brick-shadow hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span className="hidden sm:inline">OPEN IN NEW TAB</span>
            </a>
            <a
              href={cvUrl}
              download="CV_Fadhil_Priya_Haritzmanda.pdf"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-primary text-on-primary border-2 border-on-surface font-button-text text-xs font-bold uppercase brick-btn relative cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>DOWNLOAD CV</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
