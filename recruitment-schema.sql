-- Recruitment Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Job Postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
  level TEXT NOT NULL CHECK (level IN ('entry', 'mid', 'senior', 'lead')),
  salary TEXT NOT NULL,
  posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  responsibilities TEXT[] NOT NULL,
  qualifications TEXT[] NOT NULL,
  benefits TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  application_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT NOT NULL UNIQUE, -- Display ID for recruiters (e.g., "APL-2025-0001")
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'interview-scheduled', 'interviewed', 'offer', 'rejected', 'withdrawn')),
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Personal Information (encrypted/hidden until revealed)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Professional Information
  resume_file_name TEXT,
  resume_url TEXT,
  cover_letter TEXT NOT NULL,
  linkedin TEXT,
  portfolio TEXT,
  
  -- Metadata
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  revealed_at TIMESTAMP WITH TIME ZONE,
  revealed_by TEXT,
  
  -- Recruiter notes and ratings
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  interview_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings(type);
CREATE INDEX IF NOT EXISTS idx_job_postings_level ON job_postings(level);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_date ON job_postings(posted_date);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_date ON job_applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_job_applications_anonymous_id ON job_applications(anonymous_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recruitment_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_recruitment_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_recruitment_updated_at_column();

-- Function to automatically increment application_count
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_postings
  SET application_count = application_count + 1
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment application count when new application is created
CREATE TRIGGER increment_job_application_count
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION increment_application_count();

-- Function to generate unique anonymous application ID
CREATE OR REPLACE FUNCTION generate_anonymous_id()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num INTEGER;
  new_id TEXT;
BEGIN
  year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(anonymous_id FROM 'APL-' || year || '-(\d{4})') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM job_applications
  WHERE anonymous_id LIKE 'APL-' || year || '-%';
  
  new_id := 'APL-' || year || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set anonymous_id on insert
CREATE OR REPLACE FUNCTION set_anonymous_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.anonymous_id IS NULL OR NEW.anonymous_id = '' THEN
    NEW.anonymous_id := generate_anonymous_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_application_anonymous_id
  BEFORE INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_anonymous_id();

-- Enable Row Level Security (RLS)
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to active job postings
CREATE POLICY "Enable read access for all users on active job postings" 
  ON job_postings FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Enable all operations for authenticated users on job postings" 
  ON job_postings FOR ALL 
  USING (true) WITH CHECK (true);

-- Create policies for job applications (customize for production)
CREATE POLICY "Enable all operations for all users on job applications" 
  ON job_applications FOR ALL 
  USING (true) WITH CHECK (true);

-- Sample job postings
INSERT INTO job_postings (
  title, department, location, type, level, salary, posted_date,
  description, responsibilities, qualifications, benefits
) VALUES
(
  'Senior Frontend Engineer',
  'Engineering',
  'San Francisco, CA',
  'full-time',
  'senior',
  '$140,000 - $180,000',
  '2025-01-10',
  'We''re looking for a talented Senior Frontend Engineer to join our growing team and help build the next generation of our platform.',
  ARRAY[
    'Design and implement user-facing features using React and TypeScript',
    'Collaborate with designers and backend engineers to create seamless experiences',
    'Mentor junior developers and contribute to technical decisions',
    'Optimize application performance and ensure accessibility standards',
    'Participate in code reviews and maintain high code quality'
  ],
  ARRAY[
    '5+ years of professional frontend development experience',
    'Expert knowledge of React, TypeScript, and modern web technologies',
    'Strong understanding of web performance optimization',
    'Experience with design systems and component libraries',
    'Excellent communication and collaboration skills'
  ],
  ARRAY[
    'Competitive salary and equity package',
    'Health, dental, and vision insurance',
    'Flexible work arrangements and remote options',
    'Professional development budget',
    'Unlimited PTO'
  ]
),
(
  'Product Designer',
  'Design',
  'New York, NY',
  'full-time',
  'mid',
  '$110,000 - $140,000',
  '2025-01-08',
  'Join our design team to create beautiful, intuitive user experiences that delight our customers.',
  ARRAY[
    'Design end-to-end product experiences from concept to launch',
    'Create wireframes, prototypes, and high-fidelity designs',
    'Collaborate with product managers and engineers',
    'Conduct user research and usability testing',
    'Contribute to our design system'
  ],
  ARRAY[
    '3+ years of product design experience',
    'Strong portfolio demonstrating UX/UI skills',
    'Proficiency in Figma and design tools',
    'Understanding of user-centered design principles',
    'Excellent visual design skills'
  ],
  ARRAY[
    'Competitive salary and benefits',
    'Latest design tools and equipment',
    'Conference and learning budget',
    'Collaborative and creative work environment',
    'Flexible hours'
  ]
),
(
  'Data Scientist',
  'Data',
  'Remote',
  'full-time',
  'senior',
  '$130,000 - $170,000',
  '2025-01-05',
  'Help us unlock insights from data to drive product decisions and business growth.',
  ARRAY[
    'Develop machine learning models and algorithms',
    'Analyze complex datasets to extract actionable insights',
    'Collaborate with product and engineering teams',
    'Build data pipelines and infrastructure',
    'Present findings to stakeholders'
  ],
  ARRAY[
    'PhD or Master''s in Computer Science, Statistics, or related field',
    '5+ years of experience in data science or ML',
    'Strong programming skills in Python and SQL',
    'Experience with ML frameworks (TensorFlow, PyTorch)',
    'Excellent analytical and problem-solving skills'
  ],
  ARRAY[
    'Remote-first culture',
    'Top-tier compensation package',
    'Latest technology and tools',
    'Learning and development opportunities',
    'Flexible schedule'
  ]
),
(
  'Marketing Manager',
  'Marketing',
  'Austin, TX',
  'full-time',
  'mid',
  '$90,000 - $120,000',
  '2025-01-03',
  'Lead marketing initiatives to grow our brand and customer base.',
  ARRAY[
    'Develop and execute marketing campaigns',
    'Manage social media and content strategy',
    'Analyze campaign performance and ROI',
    'Collaborate with sales and product teams',
    'Build and manage marketing team'
  ],
  ARRAY[
    '4+ years of marketing experience',
    'Proven track record of successful campaigns',
    'Strong analytical and creative skills',
    'Experience with marketing automation tools',
    'Excellent communication skills'
  ],
  ARRAY[
    'Competitive compensation',
    'Creative freedom and ownership',
    'Marketing budget and tools',
    'Career growth opportunities',
    'Great team culture'
  ]
),
(
  'Software Engineering Intern',
  'Engineering',
  'San Francisco, CA',
  'internship',
  'entry',
  '$30/hour',
  '2025-01-01',
  'Join our team for a summer internship and work on real projects that impact millions of users.',
  ARRAY[
    'Work on full-stack development projects',
    'Collaborate with senior engineers',
    'Participate in code reviews and team meetings',
    'Learn industry best practices',
    'Contribute to product features'
  ],
  ARRAY[
    'Currently pursuing degree in Computer Science or related field',
    'Strong programming fundamentals',
    'Knowledge of web technologies (HTML, CSS, JavaScript)',
    'Passion for learning and problem-solving',
    'Good communication skills'
  ],
  ARRAY[
    'Competitive hourly rate',
    'Mentorship from experienced engineers',
    'Real-world project experience',
    'Networking opportunities',
    'Potential for full-time offer'
  ]
)
ON CONFLICT DO NOTHING;








