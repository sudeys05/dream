import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  RotateCcw,
  FileText,
  Calendar,
  MapPin,
  Upload,
  Download,
  Link,
  Car,
  Radio
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import './Geofiles.css';

const Geofiles = () => {
  const [geofiles, setGeofiles] = useState([]);
  const [cases, setCases] = useState([]);
  const [obEntries, setObEntries] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [policeVehicles, setPoliceVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail', 'edit', 'map'
  const [selectedGeofile, setSelectedGeofile] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fileTypes = ['KML', 'GPX', 'SHP', 'GeoJSON', 'KMZ', 'GML', 'Other'];
  const accessLevels = ['internal', 'department', 'public'];
  const [tagFilter, setTagFilter] = useState('');
  const [accessLevelFilter, setAccessLevelFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchGeofiles = async () => {
    setIsLoading(true);
    try {
      // Build query parameters for advanced filtering
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (typeFilter) queryParams.append('type', typeFilter);
      if (tagFilter) queryParams.append('tags', tagFilter);
      if (accessLevelFilter) queryParams.append('accessLevel', accessLevelFilter);
      if (dateFromFilter) queryParams.append('dateFrom', dateFromFilter);
      if (dateToFilter) queryParams.append('dateTo', dateToFilter);

      const response = await fetch(`/api/geofiles?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGeofiles(data.geofiles || []);
        setError('');
      } else {
        setError('Failed to fetch geofiles');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPoliceVehicles = async () => {
    try {
      const response = await fetch('/api/police-vehicles');
      if (response.ok) {
        const data = await response.json();
        setPoliceVehicles(data || []);
      } else {
        console.error('Failed to fetch police vehicles');
      }
    } catch (error) {
      console.error('Network error fetching police vehicles:', error);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [casesRes, obRes, evidenceRes, vehiclesRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/ob-entries'),
        fetch('/api/evidence'),
        fetch('/api/police-vehicles')
      ]);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }

      if (obRes.ok) {
        const obData = await obRes.json();
        setObEntries(obData.obEntries || []);
      }

      if (evidenceRes.ok) {
        const evidenceData = await evidenceRes.json();
        setEvidence(evidenceData.evidence || []);
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setPoliceVehicles(vehiclesData || []);
      }
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  useEffect(() => {
    fetchGeofiles();
    fetchRelatedData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchGeofiles();
  }, [searchTerm, typeFilter, tagFilter, accessLevelFilter, dateFromFilter, dateToFilter]);

  // No local filtering needed since we have server-side filtering
  const filteredGeofiles = geofiles;

  const navigateToView = (view, geofile = null) => {
    setCurrentView(view);
    setSelectedGeofile(geofile);
  };

  const goBack = () => {
    if (currentView === 'detail') {
      setCurrentView('list');
    } else if (currentView === 'edit') {
      setCurrentView('detail');
    } else if (currentView === 'map') {
      setCurrentView('list');
      setSelectedVehicle(null);
    } else {
      setCurrentView('list');
    }
    if (currentView === 'create') {
      setSelectedGeofile(null);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleDownload = async (geofileId) => {
    try {
      const response = await fetch(`/api/geofiles/${geofileId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const geofile = geofiles.find(g => g.id === geofileId);
        if (geofile?.fileUrl || geofile?.filepath) {
          window.open(geofile.fileUrl || geofile.filepath, '_blank');
        }
        // Refresh geofiles to update download count
        fetchGeofiles();
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'kml': return <Map size={16} className="file-kml" />;
      case 'gpx': return <MapPin size={16} className="file-gpx" />;
      case 'shp': return <FileText size={16} className="file-shp" />;
      case 'geojson': return <Map size={16} className="file-geojson" />;
      case 'kmz': return <Map size={16} className="file-kmz" />;
      case 'gml': return <FileText size={16} className="file-gml" />;
      default: return <FileText size={16} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const getAccessLevelBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'public': return 'access-badge public';
      case 'department': return 'access-badge department';
      case 'internal': return 'access-badge internal';
      default: return 'access-badge';
    }
  };

  const formatTags = (tagsString) => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  const GeofilesList = () => (
    <div className="geofiles-list">
      <div className="geofiles-header">
        <div className="header-content">
          <Map className="header-icon" />
          <div>
            <h1>Geo Files Management</h1>
            <p>Manage geographic data and location files</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchGeofiles}
            disabled={isLoading}
            title="Refresh geofiles list"
          >
            <RotateCcw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="view-map-btn" onClick={() => navigateToView('map')}>
            <Radio size={18} />
            Vehicle Map
          </button>
          <button className="add-geofile-btn" onClick={() => navigateToView('create')}>
            <Plus size={18} />
            Add Geofile
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="primary-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search geofiles by name, description, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All File Types</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select value={accessLevelFilter} onChange={(e) => setAccessLevelFilter(e.target.value)}>
              <option value="">All Access Levels</option>
              {accessLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
            <button 
              className="advanced-filters-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Tags:</label>
                <input
                  type="text"
                  placeholder="Search by tags (comma separated)"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date From:</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date To:</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
              <div className="filter-actions">
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('');
                    setTagFilter('');
                    setAccessLevelFilter('');
                    setDateFromFilter('');
                    setDateToFilter('');
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="geofiles-grid">
        {isLoading ? (
          <div className="loading-state">Loading geofiles...</div>
        ) : filteredGeofiles.length === 0 ? (
          <div className="empty-state">
            <Map size={48} />
            <h3>No geofiles found</h3>
            <p>Add new geofiles or adjust your search filters</p>
          </div>
        ) : (
          filteredGeofiles.map((geofile) => (
            <div key={geofile.id} className="geofile-card" onClick={() => navigateToView('detail', geofile)}>
              <div className="geofile-header">
                <div className="geofile-info">
                  <h3>{geofile.filename}</h3>
                  <p className="geofile-description">{geofile.description || 'No description'}</p>
                  {geofile.locationName && (
                    <p className="location-name">📍 {geofile.locationName}</p>
                  )}
                </div>
                <div className="file-badges">
                  <div className="file-type">
                    {getFileIcon(geofile.fileType)}
                    <span>{geofile.fileType?.toUpperCase()}</span>
                  </div>
                  <div className={getAccessLevelBadgeClass(geofile.accessLevel)}>
                    {geofile.accessLevel}
                  </div>
                </div>
              </div>
              <div className="geofile-body">
                <div className="location-info">
                  {geofile.address && (
                    <p className="address">
                      <MapPin size={14} />
                      {geofile.address}
                    </p>
                  )}
                </div>
                <div className="geofile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Size:</span>
                    <span className="stat-value">{formatFileSize(geofile.fileSize)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Downloads:</span>
                    <span className="stat-value">{geofile.downloadCount || 0}</span>
                  </div>
                </div>
                {formatTags(geofile.tags).length > 0 && (
                  <div className="geofile-tags">
                    {formatTags(geofile.tags).slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                    {formatTags(geofile.tags).length > 3 && (
                      <span className="tag-more">+{formatTags(geofile.tags).length - 3}</span>
                    )}
                  </div>
                )}
                <div className="geofile-meta">
                  <p className="upload-date">
                    <Calendar size={14} />
                    Uploaded: {new Date(geofile.createdAt).toLocaleDateString()}
                  </p>
                  {(geofile.caseId || geofile.obId || geofile.evidenceId) && (
                    <p className="linked-items">
                      <Link size={14} />
                      <span>Linked to records</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CreateGeofileForm = () => {
    const [formData, setFormData] = useState({
      filename: '',
      filepath: '',
      fileUrl: '',
      fileType: 'KML',
      fileSize: '',
      coordinates: '',
      address: '',
      locationName: '',
      description: '',
      tags: '',
      accessLevel: 'internal',
      isPublic: false,
      caseId: '',
      obId: '',
      evidenceId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.filename.trim()) newErrors.filename = 'Filename is required';
      if (!formData.filepath.trim()) newErrors.filepath = 'File path is required';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response = await fetch('/api/geofiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          await fetchGeofiles();
          goBack();
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.message || 'Failed to add geofile' });
        }
      } catch (error) {
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="geofile-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={goBack}>
            <Map size={20} />
            Back to Geofiles
          </button>
          <h1>Add New Geofile</h1>
        </div>

        <form onSubmit={handleSubmit} className="geofile-creation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="filename">Filename *</label>
              <input
                type="text"
                id="filename"
                name="filename"
                value={formData.filename}
                onChange={handleInputChange}
                placeholder="Enter filename"
                className={errors.filename ? 'error' : ''}
              />
              {errors.filename && <span className="error-text">{errors.filename}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fileType">File Type *</label>
              <select
                id="fileType"
                name="fileType"
                value={formData.fileType}
                onChange={handleInputChange}
              >
                {fileTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filepath">File Path *</label>
              <input
                type="text"
                id="filepath"
                name="filepath"
                value={formData.filepath}
                onChange={handleInputChange}
                placeholder="Enter file path or URL"
                className={errors.filepath ? 'error' : ''}
              />
              {errors.filepath && <span className="error-text">{errors.filepath}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fileUrl">Download URL (Optional)</label>
              <input
                type="text"
                id="fileUrl"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
                placeholder="Enter downloadable file URL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fileSize">File Size (bytes)</label>
              <input
                type="number"
                id="fileSize"
                name="fileSize"
                value={formData.fileSize}
                onChange={handleInputChange}
                placeholder="Enter file size in bytes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter location address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="locationName">Location Name</label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                value={formData.locationName}
                onChange={handleInputChange}
                placeholder="Enter named location reference"
              />
            </div>

            <div className="form-group">
              <label htmlFor="accessLevel">Access Level *</label>
              <select
                id="accessLevel"
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleInputChange}
              >
                {accessLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="isPublic" className="checkbox-label">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <span>Make file publicly accessible</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="patrol, downtown, routes, emergency"
              />
            </div>

            <div className="form-group">
              <label htmlFor="caseId">Linked Case (Optional)</label>
              <select
                id="caseId"
                name="caseId"
                value={formData.caseId}
                onChange={handleInputChange}
              >
                <option value="">Select a case...</option>
                {cases.map(caseItem => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.caseNumber} - {caseItem.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="obId">Linked OB Entry (Optional)</label>
              <select
                id="obId"
                name="obId"
                value={formData.obId}
                onChange={handleInputChange}
              >
                <option value="">Select an OB entry...</option>
                {obEntries.map(ob => (
                  <option key={ob.id} value={ob.id}>
                    {ob.obNumber} - {ob.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="evidenceId">Linked Evidence (Optional)</label>
              <select
                id="evidenceId"
                name="evidenceId"
                value={formData.evidenceId}
                onChange={handleInputChange}
              >
                <option value="">Select evidence...</option>
                {evidence.map(evidenceItem => (
                  <option key={evidenceItem.id} value={evidenceItem.id}>
                    {evidenceItem.evidenceNumber} - {evidenceItem.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="coordinates">Coordinates (JSON format)</label>
            <textarea
              id="coordinates"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleInputChange}
              placeholder="Enter coordinates in JSON format (optional)"
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter file description"
              rows="4"
            />
          </div>

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={goBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Geofile'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const GeofileDetail = () => {
    const linkedCase = cases.find(c => c.id === selectedGeofile?.caseId);
    const linkedOB = obEntries.find(ob => ob.id === selectedGeofile?.obId);
    const linkedEvidence = evidence.find(e => e.id === selectedGeofile?.evidenceId);

    return (
      <div className="geofile-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={goBack}>
            <Map size={20} />
            Back to Geofiles
          </button>
          <div className="detail-actions">
            <button onClick={() => handleDownload(selectedGeofile?.id)}>
              <Download size={16} />
              Download
            </button>
            <button onClick={() => navigateToView('edit', selectedGeofile)}>
              <Edit2 size={16} />
              Edit Geofile
            </button>
          </div>
        </div>
        
        <div className="geofile-info-panel">
          <div className="panel-header">
            <div className="geofile-display">
              <Map size={32} />
              <h1>{selectedGeofile?.filename}</h1>
              <div className="file-type-badge">
                {getFileIcon(selectedGeofile?.fileType)}
                {selectedGeofile?.fileType}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>File Information</h3>
              <div className="info-grid">
                <div><strong>Filename:</strong> {selectedGeofile?.filename}</div>
                <div><strong>File Type:</strong> {selectedGeofile?.fileType}</div>
                <div><strong>File Path:</strong> {selectedGeofile?.filepath}</div>
                <div><strong>Address:</strong> {selectedGeofile?.address || 'Not provided'}</div>
                <div><strong>Uploaded:</strong> {new Date(selectedGeofile?.createdAt).toLocaleString()}</div>
                <div><strong>Updated:</strong> {new Date(selectedGeofile?.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            {selectedGeofile?.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p className="geofile-description">{selectedGeofile.description}</p>
              </div>
            )}

            {selectedGeofile?.coordinates && (
              <div className="detail-section">
                <h3>Coordinates</h3>
                <pre className="coordinates-data">{selectedGeofile.coordinates}</pre>
              </div>
            )}

            <div className="detail-section">
              <h3>Linked Records</h3>
              <div className="linked-records">
                {linkedCase && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>Case: {linkedCase.caseNumber} - {linkedCase.title}</span>
                  </div>
                )}
                {linkedOB && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>OB: {linkedOB.obNumber} - {linkedOB.type}</span>
                  </div>
                )}
                {linkedEvidence && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>Evidence: {linkedEvidence.evidenceNumber} - {linkedEvidence.type}</span>
                  </div>
                )}
                {!linkedCase && !linkedOB && !linkedEvidence && (
                  <p className="no-links">No linked records found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VehicleMapView = () => (
    <div className="vehicle-map-view">
      <div className="map-header">
        <button className="back-btn" onClick={goBack}>
          <Map size={20} />
          Back to Geofiles
        </button>
        <h1>Police Vehicle Tracking Map</h1>
      </div>
      
      <div className="map-container">
        <InteractiveMap 
          vehicles={policeVehicles}
          showPatrolAreas={true}
          onVehicleSelect={handleVehicleSelect}
        />
      </div>
      
      {selectedVehicle && (
        <div className="selected-vehicle-info">
          <h3>Selected Vehicle: {selectedVehicle.vehicleId}</h3>
          <p>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</p>
          <p>Status: {selectedVehicle.status.replace('_', ' ')}</p>
          <p>License: {selectedVehicle.licensePlate}</p>
        </div>
      )}
    </div>
  );

  switch (currentView) {
    case 'detail':
      return <GeofileDetail />;
    case 'create':
      return <CreateGeofileForm />;
    case 'map':
      return <VehicleMapView />;
    default:
      return <GeofilesList />;
  }
};

export default Geofiles;