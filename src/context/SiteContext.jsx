import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  personalInfo,
  projects as defaultProjects,
  experiences as defaultExperiences,
  certifications as defaultCertifications,
  defaultHobbies,
} from '../data/portfolioData';
import {
  fetchSiteProfile,
  fetchPublishedProjects,
  fetchPublishedExperiences,
  fetchPublishedCertifications,
  fetchPublishedHobbies,
} from '../services/siteService';

const defaultProfile = {
  status: 'STATUS: READY TO BUILD',
  first_name: 'FADHIL PRIYA',
  last_name: 'HARITZMANDA',
  bio: personalInfo.description,
  tags: personalInfo.roles.join(', '),
  cv_url: personalInfo.cv || '/cv/CV_Fadhil_Priya_Haritzmanda.pdf',
};

const SiteContext = createContext({
  siteProfile: defaultProfile,
  projects: defaultProjects,
  experiences: defaultExperiences,
  certifications: defaultCertifications,
  hobbies: [],
  hobbiesError: false,
  loading: true,
  refreshSiteData: async () => {},
});

export const SiteProvider = ({ children }) => {
  const [siteProfile, setSiteProfile] = useState(defaultProfile);
  const [projects, setProjects] = useState(defaultProjects);
  const [experiences, setExperiences] = useState(defaultExperiences);
  const [certifications, setCertifications] = useState(defaultCertifications);
  const [hobbies, setHobbies] = useState([]);
  const [hobbiesError, setHobbiesError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [profileData, projectsData, expData, certData, hobbiesRes] = await Promise.all([
        fetchSiteProfile(),
        fetchPublishedProjects(),
        fetchPublishedExperiences(),
        fetchPublishedCertifications(),
        fetchPublishedHobbies(),
      ]);

      if (profileData) {
        setSiteProfile({
          status: profileData.status || defaultProfile.status,
          first_name: profileData.first_name || defaultProfile.first_name,
          last_name: profileData.last_name || defaultProfile.last_name,
          bio: profileData.bio || defaultProfile.bio,
          tags: profileData.tags || defaultProfile.tags,
          cv_url: profileData.cv_url || defaultProfile.cv_url,
        });
      }

      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
      } else {
        setProjects(defaultProjects);
      }

      if (expData && expData.length > 0) {
        setExperiences(expData);
      } else {
        setExperiences(defaultExperiences);
      }

      if (certData && certData.length > 0) {
        setCertifications(certData);
      } else {
        setCertifications(defaultCertifications);
      }

      if (hobbiesRes) {
        if (hobbiesRes.isError) {
          setHobbies(hobbiesRes.data || defaultHobbies);
          setHobbiesError(true);
        } else {
          setHobbies(hobbiesRes.data || []);
          setHobbiesError(false);
        }
      }
    } catch (err) {
      console.warn('Error loading dynamic site data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SiteContext.Provider
      value={{
        siteProfile,
        projects,
        experiences,
        certifications,
        hobbies,
        hobbiesError,
        loading,
        refreshSiteData: loadData,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => useContext(SiteContext);

