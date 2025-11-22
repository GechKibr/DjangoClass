import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  Shield, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building
} from 'lucide-react';
import axios from 'axios';
import './Report.css';

const Report = () => {
  const [step, setStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [caseId, setCaseId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger
  } = useForm();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // TODO: Replace with your actual API endpoint
        // const response = await axios.get('http:localhost:8000/api/v1/cases/categories/');
        // setCategories(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setCategories([
            { id: 1, name: 'Bribery' },
            { id: 2, name: 'Embezzlement' },
            { id: 3, name: 'Nepotism' },
            { id: 4, name: 'Fraud' },
            { id: 5, name: 'Extortion' },
            { id: 6, name: 'Abuse of Power' },
            { id: 7, name: 'Other' }
          ]);
        }, 500);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'video/mp4'];
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} type is not supported.`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = await trigger(['title', 'description', 'datetime', 'location', 'category', 'government_office']);
        break;
      case 2:
        // Evidence step is optional, so always valid
        isValid = true;
        break;
      case 3:
        if (!isAnonymous) {
          isValid = await trigger(['reporter_name', 'reporter_email', 'reporter_phone']);
        } else {
          isValid = true;
        }
        break;
      default:
        isValid = false;
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      // Append anonymous flag
      formData.append('anonymous', isAnonymous);
      
      // Append files
      uploadedFiles.forEach(file => {
        formData.append('evidence_files', file);
      });

      // TODO: Replace with your actual API endpoint
      const response = await axios.post('http://localhost:8000/api/v1/cases', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mock successful submission
      setTimeout(() => {
        const mockResponse = {
          data: {
            id: 'CR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            ...data,
            anonymous: isAnonymous
          }
        };
        
        setCaseId(mockResponse.data.id);
        setSubmitSuccess(true);
        setIsSubmitting(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting report:', error);
      alert('There was an error submitting your report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Incident Details', icon: <FileText size={18} /> },
    { number: 2, title: 'Evidence', icon: <Upload size={18} /> },
    { number: 3, title: 'Your Information', icon: <User size={18} /> },
    { number: 4, title: 'Confirmation', icon: <CheckCircle size={18} /> }
  ];

  if (submitSuccess) {
    return (
      <div className="report-container">
        <div className="success-container">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>
          <h1>Report Submitted Successfully!</h1>
          <p>Thank you for taking a stand against corruption. Your report has been received and is being processed.</p>
          
          <div className="case-info">
            <h3>Your Case ID: <span className="case-id">{caseId}</span></h3>
            <p>Please save this ID to track your case progress.</p>
          </div>

          <div className="success-actions">
            <button 
              onClick={() => window.location.href = '/track-case'} 
              className="track-case-btn"
            >
              <Eye size={20} />
              Track Your Case
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="home-btn"
            >
              Return to Home
            </button>
          </div>

          <div className="confidentiality-pledge success">
            <Shield size={20} />
            <div>
              <strong>Your report is confidential and secure.</strong>
              <p>All information is encrypted and your identity is protected.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Report Corruption</h1>
        <p>Help us fight corruption by providing detailed information about the incident.</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {steps.map((stepItem, index) => (
          <div key={stepItem.number} className={`step ${step === stepItem.number ? 'active' : ''} ${step > stepItem.number ? 'completed' : ''}`}>
            <div className="step-icon">
              {step > stepItem.number ? <CheckCircle size={16} /> : stepItem.icon}
            </div>
            <span className="step-title">{stepItem.title}</span>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="report-form">
        {/* Step 1: Incident Details */}
        {step === 1 && (
          <div className="form-step">
            <h2>Incident Details</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Incident Title *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Brief description of the incident"
                  {...register('title', { required: 'Incident title is required' })}
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category.message}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Detailed Description *</label>
                <textarea
                  id="description"
                  placeholder="Provide a detailed account of what happened, including people involved, sequence of events, and any other relevant information..."
                  rows={6}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 50, message: 'Description must be at least 50 characters' }
                  })}
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="datetime">Date & Time *</label>
                <div className="input-with-icon">
                  <Calendar size={18} />
                  <input
                    id="datetime"
                    type="datetime-local"
                    {...register('datetime', { required: 'Date and time are required' })}
                    className={errors.datetime ? 'error' : ''}
                  />
                </div>
                {errors.datetime && <span className="error-message">{errors.datetime.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input
                    id="location"
                    type="text"
                    placeholder="Where did it happen?"
                    {...register('location', { required: 'Location is required' })}
                    className={errors.location ? 'error' : ''}
                  />
                </div>
                {errors.location && <span className="error-message">{errors.location.message}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="government_office">Government Office/Individual Involved *</label>
                <div className="input-with-icon">
                  <Building size={18} />
                  <input
                    id="government_office"
                    type="text"
                    placeholder="Name of office or individual involved"
                    {...register('government_office', { required: 'This field is required' })}
                    className={errors.government_office ? 'error' : ''}
                  />
                </div>
                {errors.government_office && <span className="error-message">{errors.government_office.message}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Evidence Upload */}
        {step === 2 && (
          <div className="form-step">
            <h2>Evidence Upload</h2>
            <p className="step-description">
              Upload any supporting evidence (documents, photos, videos). This step is optional but can strengthen your case.
            </p>

            <div className="upload-area">
              <input
                type="file"
                id="evidence-upload"
                multiple
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.pdf,.mp4"
                style={{ display: 'none' }}
              />
              <label htmlFor="evidence-upload" className="upload-label">
                <Upload size={48} />
                <h3>Upload Evidence Files</h3>
                <p>Click to browse or drag and drop files here</p>
                <span className="file-types">Supported: JPG, PNG, PDF, MP4 (Max 10MB each)</span>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                <h4>Uploaded Files ({uploadedFiles.length})</h4>
                <div className="files-list">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <FileText size={16} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="remove-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Your Information */}
        {step === 3 && (
          <div className="form-step">
            <h2>Your Information</h2>

            <div className="anonymous-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-content">
                  <Shield size={20} />
                  <div>
                    <strong>Report Anonymously</strong>
                    <p>Your personal information will not be stored</p>
                  </div>
                </div>
              </label>
            </div>

            {!isAnonymous && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="reporter_name">Your Name</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input
                      id="reporter_name"
                      type="text"
                      placeholder="Enter your full name"
                      {...register('reporter_name')}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reporter_email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input
                      id="reporter_email"
                      type="email"
                      placeholder="Enter your email"
                      {...register('reporter_email', {
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.reporter_email && <span className="error-message">{errors.reporter_email.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="reporter_phone">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      id="reporter_phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      {...register('reporter_phone')}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="confidentiality-pledge">
              <Shield size={24} />
              <div>
                <strong>Your Privacy is Protected</strong>
                <p>
                  {isAnonymous 
                    ? 'Your report will be completely anonymous. No personal information will be stored or shared.'
                    : 'Your personal information is encrypted and protected. It will only be used for case follow-up and will not be shared without your consent.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="form-step">
            <h2>Review and Submit</h2>
            <p className="step-description">
              Please review your report before submitting. You cannot edit the report after submission.
            </p>

            <div className="review-section">
              <h3>Incident Details</h3>
              <div className="review-grid">
                <div className="review-item">
                  <strong>Title:</strong>
                  <span>{watch('title')}</span>
                </div>
                <div className="review-item">
                  <strong>Category:</strong>
                  <span>{categories.find(cat => cat.id == watch('category'))?.name}</span>
                </div>
                <div className="review-item">
                  <strong>Date & Time:</strong>
                  <span>{new Date(watch('datetime')).toLocaleString()}</span>
                </div>
                <div className="review-item">
                  <strong>Location:</strong>
                  <span>{watch('location')}</span>
                </div>
                <div className="review-item">
                  <strong>Office/Individual:</strong>
                  <span>{watch('government_office')}</span>
                </div>
                <div className="review-item full-width">
                  <strong>Description:</strong>
                  <span>{watch('description')}</span>
                </div>
              </div>

              <h3>Evidence</h3>
              <div className="review-item">
                <strong>Files Uploaded:</strong>
                <span>{uploadedFiles.length} file(s)</span>
              </div>

              <h3>Reporter Information</h3>
              <div className="review-item">
                <strong>Reporting Mode:</strong>
                <span>{isAnonymous ? 'Anonymous' : 'Identified'}</span>
              </div>
              {!isAnonymous && (
                <>
                  <div className="review-item">
                    <strong>Name:</strong>
                    <span>{watch('reporter_name')}</span>
                  </div>
                  <div className="review-item">
                    <strong>Email:</strong>
                    <span>{watch('reporter_email')}</span>
                  </div>
                  <div className="review-item">
                    <strong>Phone:</strong>
                    <span>{watch('reporter_phone')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="confidentiality-pledge">
              <Shield size={24} />
              <div>
                <strong>Data Confidentiality Pledge</strong>
                <p>
                  By submitting this report, you acknowledge that all information provided will be handled 
                  with strict confidentiality and in accordance with data protection laws. Your identity 
                  will be protected throughout the investigation process.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="nav-button prev">
              <ArrowLeft size={18} />
              Previous
            </button>
          )}
          
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="nav-button next">
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="nav-button submit"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Report;