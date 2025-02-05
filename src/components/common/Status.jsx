import PropTypes from 'prop-types';

const Status = ({ message, type = 'success' }) => {
  const bgColor = type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700';

  return message ? (
    <div className={`p-3 rounded-md text-sm ${bgColor}`}>
      {message}
    </div>
  ) : null;
}

Status.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error'])
};

export default Status;
