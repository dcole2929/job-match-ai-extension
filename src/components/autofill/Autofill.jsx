import PropTypes from 'prop-types';
import Status from '../common/Status';

const Autofill = ({ onAutofill, isLoading, status }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onAutofill}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium
          ${isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? 'Filling Form...' : 'Autofill Form'}
      </button>
      {status && <Status message={status?.message} type={status?.type} />}
    </div>
  );
};

Autofill.propTypes = {
  onAutofill: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  status: PropTypes.string
};
export default Autofill;

