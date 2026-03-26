import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2,
  Save,
  RefreshCw,
  Printer,
  Download,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  FileText,
  User,
  Shield,
  Landmark,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { 
  getCardClass, 
  getInputClass, 
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  FORM_CONSTANTS
} from '@/utils/formStyles';

interface CompanyScreenProps {
  isDarkMode: boolean;
}

interface CompanyData {
  companyName: string;
  businessType: string;
  registrationNo: string;
  gstNo: string;
  panNo: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  establishedYear: string;
  taxRegistrationType: string;
}

export function CompanyScreen({ isDarkMode }: CompanyScreenProps) {
  const [formData, setFormData] = useState<CompanyData>({
    companyName: 'KK Enterprises',
    businessType: 'Automobile Workshop',
    registrationNo: '',
    gstNo: '',
    panNo: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    establishedYear: '',
    taxRegistrationType: 'GST Registered'
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load company data from backend on mount
  const fetchCompanyData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/company');
      if (response.success && response.data) {
        const d = response.data;
        setFormData({
          companyName: d.company_name || 'KK Enterprises',
          businessType: d.business_type || 'Automobile Workshop',
          registrationNo: d.registration_no || '',
          gstNo: d.gst_number || '',
          panNo: d.pan_number || '',
          address: d.address || '',
          city: d.city || '',
          state: d.state || '',
          zipCode: d.pincode || '',
          phone: d.phone || '',
          email: d.email || '',
          website: d.website || '',
          bankName: d.bank_name || '',
          accountNo: d.account_no || '',
          ifscCode: d.ifsc_code || '',
          ownerName: d.owner_name || '',
          ownerPhone: d.owner_phone || '',
          ownerEmail: d.owner_email || '',
          establishedYear: d.established_year || '',
          taxRegistrationType: d.tax_reg_type || 'GST Registered'
        });
      }
    } catch (error) {
      toast.error('Failed to load company data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.companyName) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        company_name: formData.companyName,
        business_type: formData.businessType,
        registration_no: formData.registrationNo,
        gst_number: formData.gstNo,
        pan_number: formData.panNo,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.zipCode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        bank_name: formData.bankName,
        account_no: formData.accountNo,
        ifsc_code: formData.ifscCode,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        owner_email: formData.ownerEmail,
        established_year: formData.establishedYear,
        tax_reg_type: formData.taxRegistrationType
      };

      const response = await api.post('/company', payload);
      if (response.success) {
        toast.success('Company information saved successfully!');
      } else {
        toast.error(response.message || 'Failed to save company information');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `company_info_${new Date().getTime()}.json`;
    link.click();
    toast.success('Company data exported successfully!');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className={`${getCardClass(isDarkMode)} p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Company Information
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your company details and business information
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchCompanyData}
              disabled={isLoading}
              className={getSecondaryButtonClass(isDarkMode)}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button
              onClick={handlePrint}
              className={getSecondaryButtonClass(isDarkMode)}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
            <button
              onClick={handleExport}
              className={getSecondaryButtonClass(isDarkMode)}
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`${getCardClass(isDarkMode)} p-6 mb-6`}
      >
        <div className={`${FORM_CONSTANTS.FORM_MAX_WIDTH} ${FORM_CONSTANTS.FORM_MARGIN}`}>
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Building2 className="w-5 h-5 text-blue-500" />
              Basic Information
            </h2>
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Company Name <span className="text-blue-700">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Business Type <span className="text-blue-700">*</span>
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className={getInputClass(isDarkMode)}
                >
                  <option value="Automobile Workshop">Automobile Workshop</option>
                  <option value="Service Center">Service Center</option>
                  <option value="Garage">Garage</option>
                  <option value="Auto Parts Dealer">Auto Parts Dealer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Established Year
                </label>
                <input
                  type="text"
                  value={formData.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="e.g., 2010"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Tax Registration Type
                </label>
                <select
                  value={formData.taxRegistrationType}
                  onChange={(e) => handleInputChange('taxRegistrationType', e.target.value)}
                  className={getInputClass(isDarkMode)}
                >
                  <option value="GST Registered">GST Registered</option>
                  <option value="Composition Scheme">Composition Scheme</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Registration Details Section */}
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-blue-500" />
              Registration Details
            </h2>
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNo}
                  onChange={(e) => handleInputChange('registrationNo', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gstNo}
                  onChange={(e) => handleInputChange('gstNo', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="e.g., 29XXXXX1234X1Z5"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNo}
                  onChange={(e) => handleInputChange('panNo', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="e.g., ABCDE1234F"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Phone className="w-5 h-5 text-blue-500" />
              Contact Information
            </h2>
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
              <div className="lg:col-span-2">
                <label className={getLabelClass(isDarkMode)}>
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter complete address"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter ZIP code"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Landmark className="w-5 h-5 text-blue-500" />
              Bank Details
            </h2>
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNo}
                  onChange={(e) => handleInputChange('accountNo', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="e.g., HDFC0001234"
                />
              </div>
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <User className="w-5 h-5 text-blue-500" />
              Owner Information
            </h2>
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter owner name"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Owner Phone
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter owner phone"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>
                  Owner Email
                </label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  className={getInputClass(isDarkMode)}
                  placeholder="Enter owner email"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={fetchCompanyData}
              disabled={isLoading}
              className={getSecondaryButtonClass(isDarkMode)}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={getPrimaryButtonClass()}
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Company Information'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Company Status Card */}
        <div className={`${getCardClass(isDarkMode)} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-50'}`}>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Company Status
          </h3>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formData.companyName ? 'Active' : 'Incomplete'}
          </p>
        </div>

        {/* Registration Card */}
        <div className={`${getCardClass(isDarkMode)} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Tax Type
          </h3>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formData.taxRegistrationType || 'Not Set'}
          </p>
        </div>

        {/* Contact Card */}
        <div className={`${getCardClass(isDarkMode)} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Contact Info
          </h3>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formData.phone || 'Not Set'}
          </p>
        </div>

        {/* Bank Card */}
        <div className={`${getCardClass(isDarkMode)} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-800/20' : 'bg-blue-50'}`}>
              <Landmark className="w-5 h-5 text-blue-800" />
            </div>
          </div>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Bank Account
          </h3>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formData.bankName || 'Not Set'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
