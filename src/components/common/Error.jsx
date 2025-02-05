import PropTypes from 'prop-types';

const Error = ({ message, onOpenSettings }) => {
  return (
    <div className="p-4 w-96">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>{message}</p>
        {message.includes('resume') && (
          <button
            onClick={onOpenSettings}
            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
          >
            Open Settings
          </button>
        )}
      </div>
    </div>
  );
}

Error.propTypes = {
  message: PropTypes.string.isRequired,
  onOpenSettings: PropTypes.func.isRequired
};

export default Error;
