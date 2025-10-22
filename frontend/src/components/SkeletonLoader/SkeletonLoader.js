import React from 'react';
import './SkeletonLoader.css';

export const ServiceCardSkeleton = () => {
  return (
    <div className="service-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-badge"></div>
        <div className="skeleton-icon"></div>
      </div>
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
      <div className="skeleton-footer">
        <div className="skeleton-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export const BookingCardSkeleton = () => {
  return (
    <div className="booking-card skeleton">
      <div className="skeleton-booking-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-divider"></div>
      <div className="skeleton-footer">
        <div className="skeleton-text short"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export const AddressCardSkeleton = () => {
  return (
    <div className="address-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
      <div className="skeleton-footer">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="skeleton-row">
      {[...Array(columns)].map((_, index) => (
        <td key={index}>
          <div className="skeleton-text"></div>
        </td>
      ))}
    </tr>
  );
};

const SkeletonLoader = ({ type = 'service', count = 6 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'service':
        return <ServiceCardSkeleton />;
      case 'booking':
        return <BookingCardSkeleton />;
      case 'address':
        return <AddressCardSkeleton />;
      default:
        return <ServiceCardSkeleton />;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;
