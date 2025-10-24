import React from 'react';
import {
  MapPin, Eye, Search, Languages, Calendar, HardDrive, Video, Mail, Cpu, X, Globe, Cog, Code, Megaphone, BarChartBig, LineChart, PencilLine, Share2, Rocket, PieChart, MonitorCheck, FolderOpen, Terminal, History, MessageSquare, PlaneTakeoff, Users, ScrollText
} from 'lucide-react'; // Corrected CpuChip to Cpu, added Cog, Code, Megaphone, and sub-agent icons

// FIX: Add color prop to all icon components to allow dynamic coloring.
interface IconProps {
  className?: string;
  color?: string;
}

export const MapPinIcon: React.FC<IconProps> = ({ className, color }) => (
    <MapPin className={className} color={color} />
);

export const PlaneTakeoffIcon: React.FC<IconProps> = ({ className, color }) => (
    <PlaneTakeoff className={className} color={color} />
);

export const EyeIcon: React.FC<IconProps> = ({ className, color }) => (
    <Eye className={className} color={color} />
);

export const SearchIcon: React.FC<IconProps> = ({ className, color }) => (
    <Search className={className} color={color} />
);

export const LanguagesIcon: React.FC<IconProps> = ({ className, color }) => (
    <Languages className={className} color={color} />
);

export const CalendarIcon: React.FC<IconProps> = ({ className, color }) => (
    <Calendar className={className} color={color} />
);

export const HardDriveIcon: React.FC<IconProps> = ({ className, color }) => (
    <HardDrive className={className} color={color} />
);

export const VideoIcon: React.FC<IconProps> = ({ className, color }) => (
    <Video className={className} color={color} />
);

export const MailIcon: React.FC<IconProps> = ({ className, color }) => (
    <Mail className={className} color={color} />
);

export const CpuIcon: React.FC<IconProps> = ({ className, color }) => ( // Renamed from CpuChipIcon
    <Cpu className={className} color={color} />
);

export const XIcon: React.FC<IconProps> = ({ className, color }) => (
    <X className={className} color={color} />
);

export const GlobeIcon: React.FC<IconProps> = ({ className, color }) => (
    <Globe className={className} color={color} />
);

export const CogIcon: React.FC<IconProps> = ({ className, color }) => ( // Added CogIcon for settings
  <Cog className={className} color={color} />
);

export const CodeIcon: React.FC<IconProps> = ({ className, color }) => ( // Added CodeIcon for Coding Agent
  <Code className={className} color={color} />
);

// New icons for Marketing Agent and its sub-agents
export const MegaphoneIcon: React.FC<IconProps> = ({ className, color }) => (
  <Megaphone className={className} color={color} />
);

export const BarChartBigIcon: React.FC<IconProps> = ({ className, color }) => (
  <BarChartBig className={className} color={color} />
);

export const LineChartIcon: React.FC<IconProps> = ({ className, color }) => (
  <LineChart className={className} color={color} />
);

export const PencilLineIcon: React.FC<IconProps> = ({ className, color }) => (
  <PencilLine className={className} color={color} />
);

export const Share2Icon: React.FC<IconProps> = ({ className, color }) => (
  <Share2 className={className} color={color} />
);

export const RocketIcon: React.FC<IconProps> = ({ className, color }) => (
  <Rocket className={className} color={color} />
);

export const PieChartIcon: React.FC<IconProps> = ({ className, color }) => (
  <PieChart className={className} color={color} />
);

export const MonitorCheckIcon: React.FC<IconProps> = ({ className, color }) => (
  <MonitorCheck className={className} color={color} />
);

// New icons for system apps
export const FolderOpenIcon: React.FC<IconProps> = ({ className, color }) => (
  <FolderOpen className={className} color={color} />
);

export const TerminalIcon: React.FC<IconProps> = ({ className, color }) => (
  <Terminal className={className} color={color} />
);

export const HistoryIcon: React.FC<IconProps> = ({ className, color }) => (
  <History className={className} color={color} />
);

export const MessageSquareIcon: React.FC<IconProps> = ({ className, color }) => (
  <MessageSquare className={className} color={color} />
);

export const UsersIcon: React.FC<IconProps> = ({ className, color }) => (
    <Users className={className} color={color} />
);

export const ScrollTextIcon: React.FC<IconProps> = ({ className, color }) => (
    <ScrollText className={className} color={color} />
);