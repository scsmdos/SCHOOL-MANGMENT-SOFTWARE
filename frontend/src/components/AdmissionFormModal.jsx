import React, { useState } from 'react';
import { X, Upload, Camera, Lock, Loader2 } from 'lucide-react';
import api from '../api/axios';
import logoImg from '../assets/logo.jpeg';

const getPhotoSrc = (url, fallbackText) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${url}`;
};

const SectionHeader = ({ title }) => (
  <div className="flex items-center space-x-3 mb-4 mt-6">
    <h3 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest">{title}</h3>
    <div className="flex-1 h-px bg-[var(--border-color)]"></div>
  </div>
);

const InputGroup = ({ label, required, placeholder, type = "text", value, name, onChange }) => (
  <div className="flex flex-col">
    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
      {label}{required && <span className="text-[#f43f5e]">*</span>}
    </label>
    <input 
      type={type} 
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      value={value || ''}
      className={`w-full h-9 px-3 rounded text-[var(--text-primary)] text-[11px] font-medium placeholder:text-gray-400 dark:placeholder:text-[#334155] focus:outline-none focus:border-[#0ea5e9] transition-colors bg-[var(--bg-main)] border border-[var(--border-color)]`}
    />
  </div>
);

const SelectGroup = ({ label, required, options, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
      {label}{required && <span className="text-[#f43f5e]">*</span>}
    </label>
    {/* Inner wrapper for precise vertical centering of the arrow icon */}
    <div className="relative w-full h-9">
      <select 
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full h-full px-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded text-[var(--text-primary)] text-[11px] font-medium focus:outline-none focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled hidden>Select {label.replace('*','')}</option>
        {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
      </select>
      {/* Custom Dropdown Arrow precisely centered in the 36px height box */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] flex items-center justify-center">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

const AdmissionFormModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [parentPhoto, setParentPhoto] = useState(null);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const parentPhotoRef = React.useRef(null);
  const studentPhotoRef = React.useRef(null);
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    date_of_admission: new Date().toISOString().split('T')[0],
    admitted_into_class: '',
    student_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: 'MALE',
    blood_group: '',
    nationality: 'INDIAN',
    religion: 'HINDU',
    category: 'GEN',
    village: '',
    post_office: '',
    police_station: '',
    district: '',
    state: '',
    pin_code: '',
    contact_no: '',
    aadhaar_no: '',
    father_qualification: '',
    mother_qualification: '',
    father_occupation: '',
    mother_occupation: '',
    local_guardian_name: '',
    local_guardian_relation: '',
    local_guardian_contact: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  React.useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Pre-fill from existing admission data (backend field names -> form field names)
        setFormData({
          date_of_admission: editData.date_of_admission || new Date().toISOString().split('T')[0],
          admitted_into_class: editData.admitted_into_class || '',
          student_name: editData.student_name || '',
          father_name: editData.father_name || '',
          mother_name: editData.mother_name || '',
          date_of_birth: editData.date_of_birth || '',
          gender: editData.gender || 'MALE',
          blood_group: editData.blood_group || '',
          nationality: editData.nationality || 'INDIAN',
          religion: editData.religion || 'HINDU',
          category: editData.category || 'GEN',
          village: editData.village || '',
          post_office: editData.post_office || '',
          police_station: editData.police_station || '',
          district: editData.district || '',
          state: editData.state || '',
          pin_code: editData.pin_code || '',
          contact_no: editData.contact_no || '',
          aadhaar_no: editData.aadhaar_no || '',
          father_qualification: editData.qualification_father || editData.father_qualification || '',
          mother_qualification: editData.qualification_mother || editData.mother_qualification || '',
          father_occupation: editData.occupation_father || editData.father_occupation || '',
          mother_occupation: editData.occupation_mother || editData.mother_occupation || '',
          local_guardian_name: editData.local_guardian_name || '',
          local_guardian_relation: editData.relation_with_student || editData.local_guardian_relation || '',
          local_guardian_contact: editData.local_guardian_contact_no || editData.local_guardian_contact || '',
        });
      } else {
        setFormData(initialFormState);
      }
      setParentPhoto(null);
      setStudentPhoto(null);
      if (parentPhotoRef.current) parentPhotoRef.current.value = '';
      if (studentPhotoRef.current) studentPhotoRef.current.value = '';
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e, setPhotoFunc) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFunc(file);
    }
  };

  const handleSave = async () => {
    if (!formData.student_name || !formData.father_name || !formData.date_of_birth || !formData.admitted_into_class || !formData.contact_no) {
      alert("Please fill all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const dbData = new FormData();
      Object.keys(formData).forEach(key => {
         let finalKey = key;
         if (key === 'father_qualification') finalKey = 'qualification_father';
         if (key === 'mother_qualification') finalKey = 'qualification_mother';
         if (key === 'father_occupation') finalKey = 'occupation_father';
         if (key === 'mother_occupation') finalKey = 'occupation_mother';
         if (key === 'local_guardian_relation') finalKey = 'relation_with_student';
         if (key === 'local_guardian_contact') finalKey = 'local_guardian_contact_no';
         dbData.append(finalKey, formData[key]);
      });
      if (parentPhoto) dbData.append('parent_photo', parentPhoto);
      if (studentPhoto) dbData.append('student_photo', studentPhoto);

      if (editData?.rawId) {
        // EDIT MODE: PUT with _method override for multipart
        dbData.append('_method', 'PUT');
        await api.post(`/admissions/${editData.rawId}`, dbData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        // NEW MODE: POST
        await api.post('/admissions', dbData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to save admission: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 md:p-8 transition-colors">
      
      {/* Modal Container */}
      <div className="bg-[var(--bg-panel)] w-full max-w-6xl rounded-lg shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden border border-[var(--border-color)] transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-[var(--bg-panel-alt)] border-b border-[var(--border-color)] shrink-0 transition-colors">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-7 rounded overflow-hidden p-[2px] bg-white flex items-center justify-center shrink-0 border border-gray-200 dark:border-none">
               <img src={logoImg} alt="logo" className="w-full h-full object-contain" />
             </div>
             <div>
               <h2 className="text-[13px] font-bold text-[var(--text-primary)] tracking-widest uppercase mb-0.5">Admission Form</h2>
               <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase leading-none">Little Seeds School Platform</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-6 h-6 rounded flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[#e11d48] hover:border-[#e11d48] transition-colors"
          >
            <X size={14} strokeWidth={2.5}/>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative bg-[var(--bg-panel)] transition-colors">
          
          {/* Top Row - Photos and Admission Info */}
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-6 mb-2">
             
             {/* Parent Photo Dotted Box */}
              <div 
                className="w-[110px] h-[110px] shrink-0 border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] rounded flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg-panel-alt)] transition-colors group shadow-sm overflow-hidden relative"
                onClick={() => parentPhotoRef.current?.click()}
              >
                {parentPhoto ? (
                  <img src={URL.createObjectURL(parentPhoto)} alt="Parent" className="w-full h-full object-cover" />
                ) : editData?.parent_photo ? (
                  <img src={getPhotoSrc(editData.parent_photo)} alt="Parent" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <>
                    <Upload size={18} strokeWidth={2} className="text-[var(--text-secondary)] mb-2 group-hover:text-[#0ea5e9] transition-colors" />
                    <span className="text-[8px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] text-center uppercase tracking-widest leading-relaxed">Parents<br/>Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" ref={parentPhotoRef} onChange={(e) => handlePhotoUpload(e, setParentPhoto)} />
              </div>

             {/* Admission Info Wrapper Box */}
             <div className="flex-1 border border-[var(--border-color)] bg-[var(--bg-panel-alt)] rounded-lg p-5 flex flex-col justify-center shadow-sm relative transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   
                   <div className="flex flex-col">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Admission / Receipt No.</label>
                      <div className="h-9 px-3 border border-dashed border-[#64748b] dark:border-[#334155] rounded flex justify-center items-center bg-[var(--bg-panel)] shadow-sm">
                        <span className="text-[var(--text-primary)] text-[11px] font-bold tracking-widest">ADM-2026-20950</span>
                      </div>
                   </div>

                   <InputGroup 
                     label="Date of Admission" 
                     type="date" 
                     name="date_of_admission"
                     value={formData.date_of_admission}
                     onChange={handleChange}
                   />

                   <SelectGroup 
                     label="Admitted Into Class" 
                     required 
                     name="admitted_into_class"
                     value={formData.admitted_into_class}
                     onChange={handleChange}
                     options={['PLAY', 'LKG', 'UKG', 'CLASS 1', 'CLASS 2', 'CLASS 3']} 
                   />

                </div>
             </div>

             {/* Student Photo Dotted Box */}
              <div 
                className="w-[110px] h-[110px] shrink-0 border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] rounded flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg-panel-alt)] transition-colors group shadow-sm overflow-hidden relative"
                onClick={() => studentPhotoRef.current?.click()}
              >
                {studentPhoto ? (
                  <img src={URL.createObjectURL(studentPhoto)} alt="Student" className="w-full h-full object-cover" />
                ) : editData?.student_photo ? (
                  <img src={getPhotoSrc(editData.student_photo)} alt="Student" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <>
                    <Camera size={18} strokeWidth={2} className="text-[var(--text-secondary)] mb-2 group-hover:text-[#0ea5e9] transition-colors" />
                    <span className="text-[8px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] text-center uppercase tracking-widest leading-relaxed">Student<br/>Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" ref={studentPhotoRef} onChange={(e) => handlePhotoUpload(e, setStudentPhoto)} />
              </div>

          </div>

          <SectionHeader title="Student Personal Information" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
             <InputGroup label="Student's Name" required placeholder="Legal Name" name="student_name" value={formData.student_name} onChange={handleChange} />
             <InputGroup label="Father's Name" required placeholder="" name="father_name" value={formData.father_name} onChange={handleChange} />
             <InputGroup label="Mother's Name" required placeholder="" name="mother_name" value={formData.mother_name} onChange={handleChange} />
             
             <InputGroup label="Date of Birth" required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
             <SelectGroup label="Gender" options={['MALE', 'FEMALE', 'OTHER']} name="gender" value={formData.gender} onChange={handleChange} />
             <InputGroup label="Blood Group" placeholder="e.g. O+" name="blood_group" value={formData.blood_group} onChange={handleChange} />

             <SelectGroup label="Nationality" options={['INDIAN', 'NRI', 'OTHER']} name="nationality" value={formData.nationality} onChange={handleChange} />
             <SelectGroup label="Religion" options={['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'OTHER']} name="religion" value={formData.religion} onChange={handleChange} />
             <SelectGroup label="Category" options={['GEN', 'OBC', 'SC', 'ST']} name="category" value={formData.category} onChange={handleChange} />
          </div>

          <SectionHeader title="Address Details" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
             <InputGroup label="Village / Address" placeholder="" name="village" value={formData.village} onChange={handleChange} />
             <InputGroup label="Post Office" placeholder="" name="post_office" value={formData.post_office} onChange={handleChange} />
             <InputGroup label="Police Station" placeholder="" name="police_station" value={formData.police_station} onChange={handleChange} />
             <InputGroup label="District" placeholder="" name="district" value={formData.district} onChange={handleChange} />
             <InputGroup label="State" placeholder="" name="state" value={formData.state} onChange={handleChange} />
             <InputGroup label="Pin Code" placeholder="" name="pin_code" value={formData.pin_code} onChange={handleChange} />
          </div>

          <SectionHeader title="Verification Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
             <InputGroup label="Contact No. (Primary)" required placeholder="Mobile Number" name="contact_no" value={formData.contact_no} onChange={handleChange} />
             <InputGroup label="Aadhaar No." placeholder="12 Digit Number" name="aadhaar_no" value={formData.aadhaar_no} onChange={handleChange} />
          </div>

          <SectionHeader title="Parent's Details" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-4">
             <InputGroup label="Father's Qualification" placeholder="" name="father_qualification" value={formData.father_qualification} onChange={handleChange} />
             <InputGroup label="Mother's Qualification" placeholder="" name="mother_qualification" value={formData.mother_qualification} onChange={handleChange} />
             <InputGroup label="Father's Occupation" placeholder="" name="father_occupation" value={formData.father_occupation} onChange={handleChange} />
             <InputGroup label="Mother's Occupation" placeholder="" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} />
          </div>

          <SectionHeader title="Local Guardian (If Any)" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6">
             <InputGroup label="Name" placeholder="" name="local_guardian_name" value={formData.local_guardian_name} onChange={handleChange} />
             <InputGroup label="Relation" placeholder="" name="local_guardian_relation" value={formData.local_guardian_relation} onChange={handleChange} />
             <InputGroup label="Contact No." placeholder="" name="local_guardian_contact" value={formData.local_guardian_contact} onChange={handleChange} />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-gray-200 p-4 px-6 flex justify-end items-center shrink-0">
           <button 
             onClick={onClose} 
             className="px-6 py-2.5 rounded border border-gray-300 text-[10px] font-bold text-gray-700 uppercase tracking-widest mr-3 hover:bg-gray-50 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSave}
             disabled={loading}
             className="flex items-center space-x-2 px-6 py-2.5 rounded bg-[#06b6d4] hover:bg-[#0891b2] transition-colors shadow-sm disabled:opacity-50"
           >
              {loading ? <Loader2 size={12} strokeWidth={2.5} className="animate-spin text-white" /> : <Lock size={12} strokeWidth={2.5} className="text-white" />}
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{loading ? 'Saving...' : 'Save Admission'}</span>
           </button>
        </div>

      </div>
    </div>
  );
};

export default AdmissionFormModal;
