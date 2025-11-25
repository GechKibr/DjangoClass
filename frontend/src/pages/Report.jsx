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
  Plus,
  Trash2,
  AlertCircle,
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
  const [involvedParties, setInvolvedParties] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    reset
  } = useForm();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          { id: 1, name: 'Bribery' },
          { id: 2, name: 'Embezzlement' },
          { id: 3, name: 'Nepotism' },
          { id: 4, name: 'Fraud' },
          { id: 5, name: 'Extortion' },
          { id: 6, name: 'Abuse of Power' },
          { id: 7, name: 'Other' }
        ]);
      }
    };

    fetchCategories();
  }, []);

  // Handle drag and drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Handle involved parties
  const addInvolvedParty = () => {
    setInvolvedParties(prev => [
      ...prev,
      { party_type: '', name: '', position: '', department: '', temp_id: Date.now() }
    ]);
  };

  const updateInvolvedParty = (index, field, value) => {
    setInvolvedParties(prev => 
      prev.map((party, i) => 
        i === index ? { ...party, [field]: value } : party
      )
    );
  };

  const removeInvolvedParty = (index) => {
    setInvolvedParties(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    const validFiles = fileList.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'application/pdf', 
        'video/mp4',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} type is not supported. Supported types: JPG, PNG, PDF, MP4, DOC, DOCX`);
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
        isValid = await trigger(['title', 'description', 'datetime', 'location', 'category']);
        break;
      case 2:
        // Evidence step is optional, so always valid
        isValid = true;
        break;
      case 3:
        // Involved parties step - at least one party required
        if (involvedParties.length === 0) {
          alert('Please add at least one involved party');
          return;
        }
        // Validate all involved parties
        const partiesValid = involvedParties.every(party => 
          party.party_type && party.name.trim()
        );
        if (!partiesValid) {
          alert('Please fill all required fields for involved parties');
          return;
        }
        isValid = true;
        break;
      case 4:
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
      // First, create the case with involved parties data
      const caseData = {
        title: data.title,
        description: data.description,
        location: data.location,
        category_id: data.category,
        is_anonymous: isAnonymous,
        severity: data.severity || 'medium',
        involved_parties: involvedParties.map(party => ({
          party_type: party.party_type,
          name: party.name,
          position: party.position,
          department: party.department
        }))
      };

      // Add reporter info if not anonymous
      if (!isAnonymous) {
        caseData.reporter_name = data.reporter_name;
        caseData.reporter_email = data.reporter_email;
        caseData.reporter_phone = data.reporter_phone;
      }

      console.log('Submitting case data:', caseData);

      const caseResponse = await axios.post(
        'http://127.0.0.1:8000/api/v1/cases/', 
        caseData
      );

      const createdCase = caseResponse.data;
      setCaseId(createdCase.tracking_id);

      // Upload attachments if any
      if (uploadedFiles.length > 0) {
        console.log('Uploading attachments:', uploadedFiles);
        
        const formData = new FormData();
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('case', createdCase.id);

        try {
          await axios.post(
            'http://127.0.0.1:8000/api/v1/attachments/', 
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        } catch (attachmentError) {
          console.error('Error uploading attachments:', attachmentError);
          // Don't fail the whole submission if attachments fail
        }
      }

      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      // Reset form
      reset();
      setInvolvedParties([]);
      setUploadedFiles([]);

    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error response:', error.response?.data);
      alert(`There was an error submitting your report: ${error.response?.data?.message || error.message}`);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Incident Details', icon: FileText },
    { number: 2, title: 'Evidence', icon: Upload },
    { number: 3, title: 'Involved Parties', icon: User },
    { number: 4, title: 'Your Information', icon: Shield },
    { number: 5, title: 'Confirmation', icon: CheckCircle }
  ];

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Report Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for taking a stand against corruption. Your report has been received and is being processed.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Your Case ID: <span className="font-mono bg-blue-900 text-yellow-400 px-3 py-1 rounded-md">{caseId}</span>
              </h3>
              <p className="text-blue-700">Please save this ID to track your case progress.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={() => window.location.href = '/track-case'} 
                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
              >
                <Eye className="w-5 h-5 mr-2" />
                Track Your Case
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <strong className="text-green-900 block mb-1">Your report is confidential and secure.</strong>
                  <p className="text-green-700">All information is encrypted and your identity is protected.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Report Corruption
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us fight corruption by providing detailed information about the incident.
            Your report makes a difference.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12 relative">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.number;
            const isCompleted = step > stepItem.number;
            
            return (
              <div key={stepItem.number} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-600 text-white shadow-lg' : 
                    'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`
                    absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} style={{ left: '60%' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Incident Details */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Details</h2>
                  <p className="text-gray-600">Provide basic information about the corruption incident.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Incident Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Brief description of the incident"
                      {...register('title', { required: 'Incident title is required' })}
                      className={`
                        w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200
                        ${errors.title ? 'border-red-500' : 'border-gray-300'}
                      `}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      {...register('category', { required: 'Category is required' })}
                      className={`
                        w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200
                        ${errors.category ? 'border-red-500' : 'border-gray-300'}
                      `}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Severity */}
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <select
                      id="severity"
                      {...register('severity')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`
                        w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none
                        ${errors.description ? 'border-red-500' : 'border-gray-300'}
                      `}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.description.message}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-500 text-right">
                      {watch('description')?.length || 0} characters
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="datetime"
                        type="datetime-local"
                        {...register('datetime', { required: 'Date and time are required' })}
                        className={`
                          w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200
                          ${errors.datetime ? 'border-red-500' : 'border-gray-300'}
                        `}
                      />
                    </div>
                    {errors.datetime && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.datetime.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="location"
                        type="text"
                        placeholder="Where did it happen?"
                        {...register('location', { required: 'Location is required' })}
                        className={`
                          w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200
                          ${errors.location ? 'border-red-500' : 'border-gray-300'}
                        `}
                      />
                    </div>
                    {errors.location && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Evidence Upload */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Evidence Upload</h2>
                  <p className="text-gray-600">
                    Upload any supporting evidence (documents, photos, videos). This step is optional but can strengthen your case.
                  </p>
                </div>

                <div
                  className={`
                    border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-200 cursor-pointer
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('evidence-upload').click()}
                >
                  <input
                    type="file"
                    id="evidence-upload"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx"
                    className="hidden"
                  />
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload Evidence Files</h3>
                  <p className="text-gray-500 mb-2">Click to browse or drag and drop files here</p>
                  <p className="text-sm text-gray-400">
                    Supported: JPG, PNG, PDF, MP4, DOC, DOCX (Max 10MB each)
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-700">{file.name}</span>
                            <span className="text-sm text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Involved Parties */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Involved Parties</h2>
                  <p className="text-gray-600">
                    Add information about the government offices, officials, or individuals involved in the corruption incident.
                  </p>
                </div>

                <div className="space-y-6">
                  {involvedParties.map((party, index) => (
                    <div key={party.temp_id || index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Involved Party #{index + 1}</h4>
                        <button 
                          type="button" 
                          onClick={() => removeInvolvedParty(index)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type *
                          </label>
                          <select
                            value={party.party_type}
                            onChange={(e) => updateInvolvedParty(index, 'party_type', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select type</option>
                            <option value="government_office">Government Office</option>
                            <option value="public_official">Public Official</option>
                            <option value="private_company">Private Company</option>
                            <option value="individual">Individual</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Name of office or individual"
                            value={party.name}
                            onChange={(e) => updateInvolvedParty(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <input
                            type="text"
                            placeholder="Position or role"
                            value={party.position}
                            onChange={(e) => updateInvolvedParty(index, 'position', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <input
                            type="text"
                            placeholder="Department or unit"
                            value={party.department}
                            onChange={(e) => updateInvolvedParty(index, 'department', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    onClick={addInvolvedParty}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 transition-colors duration-200 flex items-center justify-center space-x-2 text-gray-600"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Another Involved Party</span>
                  </button>
                </div>

                {involvedParties.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                    <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No involved parties added yet. Click the button above to add parties involved in the corruption incident.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Your Information */}
            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h2>
                  <p className="text-gray-600">
                    Choose how you want to be identified when reporting this incident.
                  </p>
                </div>

                {/* Anonymous Toggle */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center space-x-4 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`
                        w-14 h-8 rounded-full transition-colors duration-200
                        ${isAnonymous ? 'bg-green-500' : 'bg-gray-300'}
                      `} />
                      <div className={`
                        absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200
                        ${isAnonymous ? 'transform translate-x-6' : ''}
                      `} />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-gray-600" />
                      <div>
                        <strong className="text-gray-900 block">Report Anonymously</strong>
                        <p className="text-gray-600 text-sm">Your personal information will not be stored</p>
                      </div>
                    </div>
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="reporter_name"
                          type="text"
                          placeholder="Enter your full name"
                          {...register('reporter_name')}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reporter_email" className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                      {errors.reporter_email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.reporter_email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="reporter_phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="reporter_phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          {...register('reporter_phone')}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Confidentiality Pledge */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-blue-900 block mb-2">Your Privacy is Protected</strong>
                      <p className="text-blue-700">
                        {isAnonymous 
                          ? 'Your report will be completely anonymous. No personal information will be stored or shared.'
                          : 'Your personal information is encrypted and protected. It will only be used for case follow-up and will not be shared without your consent.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review and Submit</h2>
                  <p className="text-gray-600">
                    Please review your report before submitting. You cannot edit the report after submission.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Incident Details */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Incident Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-gray-700">Title:</strong>
                        <p className="text-gray-900">{watch('title')}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700">Category:</strong>
                        <p className="text-gray-900">{categories.find(cat => cat.id == watch('category'))?.name}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700">Severity:</strong>
                        <p className="text-gray-900 capitalize">{watch('severity') || 'Medium'}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700">Date & Time:</strong>
                        <p className="text-gray-900">{new Date(watch('datetime')).toLocaleString()}</p>
                      </div>
                      <div className="md:col-span-2">
                        <strong className="text-gray-700">Location:</strong>
                        <p className="text-gray-900">{watch('location')}</p>
                      </div>
                      <div className="md:col-span-2">
                        <strong className="text-gray-700">Description:</strong>
                        <p className="text-gray-900 whitespace-pre-wrap">{watch('description')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Involved Parties */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Involved Parties</h3>
                    {involvedParties.length > 0 ? (
                      <div className="space-y-4">
                        {involvedParties.map((party, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <strong className="text-gray-700">Party #{index + 1}:</strong>
                                <p className="text-gray-900">{party.name}</p>
                              </div>
                              <div>
                                <strong className="text-gray-700">Type:</strong>
                                <p className="text-gray-900 capitalize">{party.party_type.replace('_', ' ')}</p>
                              </div>
                              {party.position && (
                                <div>
                                  <strong className="text-gray-700">Position:</strong>
                                  <p className="text-gray-900">{party.position}</p>
                                </div>
                              )}
                              {party.department && (
                                <div>
                                  <strong className="text-gray-700">Department:</strong>
                                  <p className="text-gray-900">{party.department}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No involved parties added</p>
                    )}
                  </div>

                  {/* Evidence */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Evidence</h3>
                    <div>
                      <strong className="text-gray-700">Files Uploaded:</strong>
                      <p className="text-gray-900">{uploadedFiles.length} file(s)</p>
                    </div>
                  </div>

                  {/* Reporter Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Reporter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-gray-700">Reporting Mode:</strong>
                        <p className="text-gray-900">{isAnonymous ? 'Anonymous' : 'Identified'}</p>
                      </div>
                      {!isAnonymous && (
                        <>
                          <div>
                            <strong className="text-gray-700">Name:</strong>
                            <p className="text-gray-900">{watch('reporter_name')}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Email:</strong>
                            <p className="text-gray-900">{watch('reporter_email')}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Phone:</strong>
                            <p className="text-gray-900">{watch('reporter_phone')}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Final Confidentiality Pledge */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-blue-900 block mb-2">Data Confidentiality Pledge</strong>
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
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>
              )}
              
              {step < 5 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 ml-auto"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors duration-200 ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Report
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Report;