import PropTypes from 'prop-types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Skills = ({ selectedSkill, suggestions, onBack }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Analysis
      </button>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-4">
          How to acquire: {selectedSkill}
        </h4>
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700">Short-term actions:</h5>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {suggestions.shortTerm.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-700">Resources:</h5>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {suggestions.resources.map((resource, index) => (
                <li key={index}>{resource}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

Skills.propTypes = {
  selectedSkill: PropTypes.string.isRequired,
  suggestions: PropTypes.shape({
    shortTerm: PropTypes.arrayOf(PropTypes.string).isRequired,
    resources: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onBack: PropTypes.func.isRequired
};

export default Skills;
