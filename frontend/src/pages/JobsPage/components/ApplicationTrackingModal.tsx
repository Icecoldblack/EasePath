import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Job } from './JobCard';
import './ApplicationTrackingModal.css';

interface ApplicationTrackingModalProps {
    job: Job | null;
    isOpen: boolean;
    isLoading: boolean;
    onTrack: () => void;
    onSkip: () => void;
}

const ApplicationTrackingModal: React.FC<ApplicationTrackingModalProps> = ({
    job,
    isOpen,
    isLoading,
    onTrack,
    onSkip,
}) => {
    if (!job) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onSkip}
                >
                    <motion.div
                        className="tracking-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h3>Did you apply to this job?</h3>
                        <p className="modal-job-info">
                            <strong>{job.job_title}</strong>
                            <span>{job.employer_name}</span>
                        </p>
                        <p className="modal-description">
                            Track this application to monitor your progress in "My Applications"
                        </p>
                        <div className="modal-actions">
                            <button
                                className="modal-btn secondary"
                                onClick={onSkip}
                                disabled={isLoading}
                            >
                                Not Yet
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={onTrack}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Yes, I Applied!'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApplicationTrackingModal;
