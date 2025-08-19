import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Car, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Navigation,
  Radio,
  Shield
} from 'lucide-react';
import './InteractiveMap.css';

const InteractiveMap = ({ vehicles = [], showPatrolAreas = true, onVehicleSelect }) => {
  const mapRef = useRef(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapCenter, setMapCenter] = useState([-122.4194, 37.7749]); // San Francisco default
  const [zoom, setZoom] = useState(12);

  // Vehicle status colors and icons
  const getVehicleStatusIcon = (vehicleType, status) => {
    const iconProps = { size: 20 };
    
    switch (vehicleType) {
      case 'motorcycle':
        return <Car {...iconProps} />;
      case 'k9':
        return <Shield {...iconProps} />;
      case 'special':
        return <Truck {...iconProps} />;
      default:
        return <Car {...iconProps} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#2ecc71';
      case 'on_patrol':
        return '#3498db';
      case 'responding':
        return '#e74c3c';
      case 'out_of_service':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 16 };
    
    switch (status) {
      case 'available':
        return <CheckCircle {...iconProps} />;
      case 'on_patrol':
        return <Navigation {...iconProps} />;
      case 'responding':
        return <AlertTriangle {...iconProps} />;
      case 'out_of_service':
        return <XCircle {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  // Parse coordinates from JSON string
  const parseCoordinates = (coordString) => {
    try {
      return JSON.parse(coordString);
    } catch {
      return null;
    }
  };

  // Generate patrol area path for SVG
  const generatePatrolAreaPath = (coordinates) => {
    if (!coordinates || coordinates.length < 3) return '';
    
    const pathCommands = coordinates.map((coord, index) => {
      const [lng, lat] = coord;
      const x = ((lng + 122.5) / 0.1) * 100; // Convert to percentage
      const y = ((37.8 - lat) / 0.1) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathCommands + ' Z';
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
    
    // Center map on vehicle
    const coords = parseCoordinates(vehicle.currentLocation);
    if (coords) {
      setMapCenter(coords);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  const resetMap = () => {
    setMapCenter([-122.4194, 37.7749]);
    setZoom(12);
    setSelectedVehicle(null);
  };

  return (
    <div className="interactive-map-container">
      <div className="map-header">
        <div className="map-title">
          <Radio size={24} />
          <h3>Police Vehicle Tracking</h3>
        </div>
        <div className="map-controls">
          <button 
            className={`control-btn ${showPatrolAreas ? 'active' : ''}`}
            onClick={() => {}} // This would toggle patrol areas
            title="Toggle Patrol Areas"
          >
            <MapPin size={16} />
            Areas
          </button>
          <button className="control-btn" onClick={handleZoomIn} title="Zoom In">
            +
          </button>
          <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">
            -
          </button>
          <button className="control-btn" onClick={resetMap} title="Reset View">
            <Navigation size={16} />
          </button>
        </div>
      </div>

      <div className="map-viewport" ref={mapRef}>
        <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {/* Base map background */}
          <rect width="100" height="100" fill="#1a1f2e" />
          
          {/* Grid lines for reference */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Patrol Areas */}
          {showPatrolAreas && vehicles.map((vehicle) => {
            const areaCoords = parseCoordinates(vehicle.assignedArea);
            if (!areaCoords) return null;
            
            const pathData = generatePatrolAreaPath(areaCoords);
            
            return (
              <g key={`area-${vehicle.id}`}>
                <path
                  d={pathData}
                  fill={getStatusColor(vehicle.status)}
                  fillOpacity="0.1"
                  stroke={getStatusColor(vehicle.status)}
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                <text
                  x={areaCoords[0] ? ((areaCoords[0][0] + 122.5) / 0.1) * 100 : 50}
                  y={areaCoords[0] ? ((37.8 - areaCoords[0][1]) / 0.1) * 100 : 50}
                  fill={getStatusColor(vehicle.status)}
                  fontSize="3"
                  textAnchor="middle"
                  className="area-label"
                >
                  {vehicle.vehicleId}
                </text>
              </g>
            );
          })}

          {/* Vehicle Markers */}
          {vehicles.map((vehicle) => {
            const coords = parseCoordinates(vehicle.currentLocation);
            if (!coords) return null;
            
            const [lng, lat] = coords;
            const x = ((lng + 122.5) / 0.1) * 100;
            const y = ((37.8 - lat) / 0.1) * 100;
            
            return (
              <g 
                key={`vehicle-${vehicle.id}`}
                transform={`translate(${x}, ${y})`}
                className={`vehicle-marker ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                onClick={() => handleVehicleClick(vehicle)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r="2"
                  fill={getStatusColor(vehicle.status)}
                  stroke="#fff"
                  strokeWidth="0.5"
                  className="vehicle-dot"
                />
                <circle
                  r="3"
                  fill="transparent"
                  stroke={getStatusColor(vehicle.status)}
                  strokeWidth="0.3"
                  opacity="0.6"
                  className="vehicle-pulse"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vehicle Status Panel */}
      <div className="vehicle-status-panel">
        <h4>Vehicle Status</h4>
        <div className="status-list">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id}
              className={`status-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
              onClick={() => handleVehicleClick(vehicle)}
            >
              <div className="status-icon" style={{ color: getStatusColor(vehicle.status) }}>
                {getVehicleStatusIcon(vehicle.vehicleType, vehicle.status)}
              </div>
              <div className="status-info">
                <div className="vehicle-id">{vehicle.vehicleId}</div>
                <div className="vehicle-details">
                  {vehicle.make} {vehicle.model}
                </div>
              </div>
              <div className="status-badge" style={{ backgroundColor: getStatusColor(vehicle.status) }}>
                {getStatusIcon(vehicle.status)}
                <span>{vehicle.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="vehicle-details-panel">
          <div className="details-header">
            <h4>{selectedVehicle.vehicleId}</h4>
            <button 
              className="close-btn"
              onClick={() => setSelectedVehicle(null)}
            >
              ×
            </button>
          </div>
          <div className="details-content">
            <div className="detail-row">
              <span className="label">Vehicle:</span>
              <span>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</span>
            </div>
            <div className="detail-row">
              <span className="label">License:</span>
              <span>{selectedVehicle.licensePlate}</span>
            </div>
            <div className="detail-row">
              <span className="label">Type:</span>
              <span>{selectedVehicle.vehicleType}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span 
                className="status-text"
                style={{ color: getStatusColor(selectedVehicle.status) }}
              >
                {getStatusIcon(selectedVehicle.status)}
                {selectedVehicle.status.replace('_', ' ')}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Last Update:</span>
              <span>{new Date(selectedVehicle.lastUpdate).toLocaleString()}</span>
            </div>
            {selectedVehicle.assignedOfficerId && (
              <div className="detail-row">
                <span className="label">Assigned Officer:</span>
                <span>Officer #{selectedVehicle.assignedOfficerId}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="map-legend">
        <h5>Legend</h5>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#2ecc71' }}></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3498db' }}></div>
            <span>On Patrol</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
            <span>Responding</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#95a5a6' }}></div>
            <span>Out of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;