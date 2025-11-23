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
  Building,
  X,
  Loader2
} from 'lucide-react';
import axios from 'axios';

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
        const response = await axios.get('http:localhost:8000/api/v1/cases/categories/');
        setCategories(response.data);
        
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
      
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      formData.append('anonymous', isAnonymous);
      
      uploadedFiles.forEach(file => {
        formData.append('evidence_files', file);
      });

      // TODO: Replace with your actual API endpoint
      const response = await axios.post('http://localhost:8000/api/v1/cases', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Report Submitted Successfully!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Thank you for taking a stand against corruption. Your report has been received and is being processed.
            </p>
            
            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your Case ID: <span className="text-blue-600 font-mono">{caseId}</span>
              </h3>
              <p className="text-gray-600">Please save this ID to track your case progress.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={() => window.location.href = '/track-case'} 
                className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="w-5 h-5 mr-2" />
                Track Your Case
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 flex items-start">
              <Shield className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <strong className="text-green-800">Your report is confidential and secure.</strong>
                <p className="text-green-700 text-sm mt-1">
                  All information is encrypted and your identity is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Report Corruption
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us fight corruption by providing detailed information about the incident. Your report makes a difference.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((stepItem, index) => (
              <React.Fragment key={stepItem.number}>
                <div className={`flex flex-col items-center ${
                  step === stepItem.number ? 'text-blue-600' : 
                  step > stepItem.number ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step === stepItem.number ? 'bg-blue-600 border-blue-600 text-white' : 
                    step > stepItem.number ? 'bg-green-600 border-green-600 text-white' : 
                    'border-gray-300 bg-white'
                  }`}>
                    {step > stepItem.number ? <CheckCircle size={20} /> : stepItem.icon}
                  </div>
                  <span className="text-sm font-medium mt-2 hidden sm:block">
                    {stepItem.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 transition-colors duration-300 ${
                    step > stepItem.number ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-xl p-8">
          {/* Step 1: Incident Details */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Details</h2>
                <p className="text-gray-600">Provide comprehensive information about the corruption incident.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Incident Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Brief description of the incident"
                    {...register('title', { required: 'Incident title is required' })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="category"
                    {...register('category', { required: 'Category is required' })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
                    Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="datetime"
                      type="datetime-local"
                      {...register('datetime', { required: 'Date and time are required' })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.datetime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.datetime && (
                    <p className="text-red-600 text-sm mt-1">{errors.datetime.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="location"
                      type="text"
                      placeholder="Where did it happen?"
                      {...register('location', { required: 'Location is required' })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="government_office" className="block text-sm font-medium text-gray-700">
                    Government Office/Individual Involved *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="government_office"
                      type="text"
                      placeholder="Name of office or individual involved"
                      {...register('government_office', { required: 'This field is required' })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.government_office ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.government_office && (
                    <p className="text-red-600 text-sm mt-1">{errors.government_office.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    placeholder="Provide a detailed account of what happened, including people involved, sequence of events, and any other relevant information..."
                    rows={6}
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 50, message: 'Description must be at least 50 characters' }
                    })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Evidence Upload */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Evidence Upload</h2>
                <p className="text-gray-600">
                  Upload any supporting evidence (documents, photos, videos). This step is optional but can strengthen your case.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors duration-200">
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  onChange={handleFileUpload}
                  accept=".jpg,.jpeg,.png,.pdf,.mp4"
                  className="hidden"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Evidence Files</h3>
                  <p className="text-gray-600 mb-4">Click to browse or drag and drop files here</p>
                  <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                    Supported: JPG, PNG, PDF, MP4 (Max 10MB each)
                  </span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-900">{file.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="w-5 h-5" />
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
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h2>
                <p className="text-gray-600">Choose how you'd like to be identified in this report.</p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    isAnonymous ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                      isAnonymous ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <div>
                      <strong className="text-gray-900 block">Report Anonymously</strong>
                      <p className="text-gray-600 text-sm">Your personal information will not be stored</p>
                    </div>
                  </div>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="reporter_name"
                        type="text"
                        placeholder="Enter your full name"
                        {...register('reporter_name')}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reporter_email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.reporter_email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.reporter_email && (
                      <p className="text-red-600 text-sm mt-1">{errors.reporter_email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reporter_phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="reporter_phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register('reporter_phone')}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 rounded-2xl p-6 flex items-start">
                <Shield className="w-8 h-8 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800 block text-lg mb-1">Your Privacy is Protected</strong>
                  <p className="text-green-700">
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
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review and Submit</h2>
                <p className="text-gray-600">
                  Please review your report before submitting. You cannot edit the report after submission.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Incident Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-6">
                    <div>
                      <strong className="text-gray-700">Title:</strong>
                      <p className="text-gray-900 mt-1">{watch('title')}</p>
                    </div>
                    <div>
                      <strong className="text-gray-700">Category:</strong>
                      <p className="text-gray-900 mt-1">{categories.find(cat => cat.id == watch('category'))?.name}</p>
                    </div>
                    <div>
                      <strong className="text-gray-700">Date & Time:</strong>
                      <p className="text-gray-900 mt-1">{new Date(watch('datetime')).toLocaleString()}</p>
                    </div>
                    <div>
                      <strong className="text-gray-700">Location:</strong>
                      <p className="text-gray-900 mt-1">{watch('location')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <strong className="text-gray-700">Office/Individual:</strong>
                      <p className="text-gray-900 mt-1">{watch('government_office')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <strong className="text-gray-700">Description:</strong>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{watch('description')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Evidence</h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <strong className="text-gray-700">Files Uploaded:</strong>
                    <p className="text-gray-900 mt-1">{uploadedFiles.length} file(s)</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Reporter Information</h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="mb-3">
                      <strong className="text-gray-700">Reporting Mode:</strong>
                      <p className="text-gray-900 mt-1">{isAnonymous ? 'Anonymous' : 'Identified'}</p>
                    </div>
                    {!isAnonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong className="text-gray-700">Name:</strong>
                          <p className="text-gray-900 mt-1">{watch('reporter_name')}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Email:</strong>
                          <p className="text-gray-900 mt-1">{watch('reporter_email')}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Phone:</strong>
                          <p className="text-gray-900 mt-1">{watch('reporter_phone')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="flex items-start">
                  <Shield className="w-8 h-8 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-blue-800 block text-lg mb-2">Data Confidentiality Pledge</strong>
                    <p className="text-blue-700">
                      By submitting this report, you acknowledge that all information provided will be handled 
                      with strict confidentiality and in accordance with data protection laws. Your identity 
                      will be protected throughout the investigation process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>
            )}
            
            {step < 4 ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold ml-auto"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 font-semibold ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;