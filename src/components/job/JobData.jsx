import { BriefcaseIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const JobData = ({ jobData }) => {
  return (
    <div className="flex items-start space-x-3">
      <BriefcaseIcon className="h-6 w-6 text-blue-500 mt-1" />
      <div>
        <h2 className="text-xl font-bold">{jobData.title}</h2>
        <p className="text-gray-600">{jobData.company}</p>
      </div>
    </div>
  );
}

JobData.propTypes = {
  jobData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired
  }).isRequired
};

export default JobData;
