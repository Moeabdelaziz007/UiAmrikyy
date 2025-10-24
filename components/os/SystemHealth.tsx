import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import useSystemStore from '../../stores/systemStore';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';

const StatCard: React.FC<{ icon: React.FC<any>, title: string, value: string | number, colorClass: string }> = ({ icon: Icon, title, value, colorClass }) => {
    return (
        <div className="bg-surface p-4 rounded-lg flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}/20`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text">{value}</p>
            </div>
        </div>
    );
};

const SystemHealth: React.FC = () => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const { totalTasks, successfulTasks, failedTasks, successfulDebugs } = useSystemStore();
    const currentText = translations.global[lang];

    const reliability = totalTasks > 0 ? ((successfulTasks / totalTasks) * 100).toFixed(1) : '100.0';

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity /> {currentText.systemHealth}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Activity} title={currentText.totalTasks} value={totalTasks} colorClass="text-primary" />
                <StatCard icon={CheckCircle} title={currentText.successfulTasks} value={successfulTasks} colorClass="text-success" />
                <StatCard icon={XCircle} title={currentText.failedTasks} value={failedTasks} colorClass="text-error" />
                <StatCard icon={ShieldCheck} title={currentText.successfulDebugs} value={successfulDebugs} colorClass="text-cyan-500" />
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">{currentText.reliability}</h3>
                <div className="w-full bg-surface rounded-full h-4 overflow-hidden">
                    <motion.div
                        className="bg-success h-4"
                        initial={{ width: 0 }}
                        animate={{ width: `${reliability}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                <p className="text-right mt-1 text-sm font-bold">{reliability}%</p>
            </div>
        </div>
    );
};

export default SystemHealth;