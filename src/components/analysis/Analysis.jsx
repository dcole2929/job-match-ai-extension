import PropTypes from 'prop-types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Analysis = ({ analysis, onSkillClick }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Match Score</h3>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getScoreColor(analysis.matchScore)} transition-all duration-500`}
            style={{ width: `${analysis.matchScore}%` }}
          />
        </div>
        <p className="text-right text-sm text-gray-600 mt-1">
          {analysis.matchScore}%
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          Matching Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.matchingSkills.map((skill, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          Missing Requirements
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.missingSkills.map((skill, index) => (
            <button
              key={index}
              onClick={() => onSkillClick(skill)}
              className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm hover:bg-red-200 transition-colors"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Analysis.propTypes = {
  analysis: PropTypes.shape({
    matchScore: PropTypes.number.isRequired,
    matchingSkills: PropTypes.arrayOf(PropTypes.string).isRequired,
    missingSkills: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onSkillClick: PropTypes.func.isRequired
};

export default Analysis;
