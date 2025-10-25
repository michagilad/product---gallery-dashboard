
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Target, Edit, ClipboardCheck } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Add types for window-injected libraries to satisfy TypeScript
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

// Main Dashboard Component
interface DashboardProps {
  isAdmin?: boolean;
}

export default function Dashboard({ isAdmin = false }: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('ticketTriageDashboard');

  // Default stats
  const defaultStats = {
    totalExperiences: '58851',
    totalProducts: '28475',
    totalGalleries: '26079',
    raptorDelivered: '21170',
    inProgress: '1538',
    failed: '636',
    readyForAutopost: '104',
    weeklyGoal: '5979',
    weeklyAvailable: '4922',
    weeklyRaptor: '2853',
    weeklyNonRaptor: '2070',
    qcReviewed: '4229',
    qcApproved: '1554',
    qcRejected: '2675',
    triageReviewed: '1600',
    triageNoPost: '18.6',
    triagePlatformPost: '67.7',
    triageStuck: '11.5',
    triageReshoots: '2.2',
  };

  // Initialize state with saved data or defaults
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('dashboard-stats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        return parsedStats;
      } catch (error) {
        console.error('Error parsing saved stats:', error);
        return defaultStats;
      }
    }
    return defaultStats;
  });

  // Save data to localStorage whenever stats change (but not on initial load)
  useEffect(() => {
    // Only save if we're not in the initial render
    const isInitialLoad = localStorage.getItem('dashboard-stats') === null;
    if (!isInitialLoad) {
      localStorage.setItem('dashboard-stats', JSON.stringify(stats));
    }
  }, [stats]);

  // Set active tab to 'data' when in admin mode
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('data');
    }
  }, [isAdmin]);

  const statLabels: Record<keyof typeof stats, string> = {
    totalExperiences: 'Total Experiences',
    totalProducts: 'Total Products Captured',
    totalGalleries: 'Total Galleries Generated',
    raptorDelivered: 'Raptor Galleries Delivered',
    inProgress: 'Galleries In Progress',
    failed: 'Failed Galleries',
    readyForAutopost: 'Ready for Auto-Post',
    weeklyGoal: 'Weekly Goal',
    weeklyAvailable: 'Weekly Available',
    weeklyRaptor: 'Weekly Raptor',
    weeklyNonRaptor: 'Weekly Non-Raptor',
    qcReviewed: 'QC Galleries Reviewed',
    qcApproved: 'QC Galleries Approved',
    qcRejected: 'QC Galleries Rejected',
    triageReviewed: 'Triage Galleries Reviewed',
    triageNoPost: 'Triage - No Post Fixes (%)',
    triagePlatformPost: 'Triage - Platform Post Fixes (%)',
    triageStuck: 'Triage - Stuck (%)',
    triageReshoots: 'Triage - Reshoots Requested (%)',
  };

  const statLinks: Partial<Record<keyof typeof stats, string>> = {
    totalExperiences: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55055945/list',
    totalProducts: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55055959/list',
    totalGalleries: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55055964/list',
    raptorDelivered: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55055971/list',
    inProgress: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55056008/list',
    failed: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55056084/list',
    readyForAutopost: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55056160/list',
    weeklyAvailable: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55056176/list',
    weeklyRaptor: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55056256/list',
    weeklyNonRaptor: 'https://app.hubspot.com/contacts/21788053/objects/2-43951717/views/55056281/list',
  };

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newStats = {
      ...stats,
      [name]: value,
    };
    setStats(newStats);
    // Save immediately to localStorage
    localStorage.setItem('dashboard-stats', JSON.stringify(newStats));
  };

  // --- Derived State: Parse string stats into numbers for calculations ---
  // Helper functions to parse stats, allowing for commas in input
  const parseIntStat = (value: string) => parseInt(String(value).replace(/,/g, ''), 10) || 0;
  const parseFloatStat = (value: string) => parseFloat(String(value).replace(/,/g, '')) || 0;

  const numericStats = {
    totalExperiences: parseIntStat(stats.totalExperiences),
    totalProducts: parseIntStat(stats.totalProducts),
    totalGalleries: parseIntStat(stats.totalGalleries),
    raptorDelivered: parseIntStat(stats.raptorDelivered),
    inProgress: parseIntStat(stats.inProgress),
    failed: parseIntStat(stats.failed),
    readyForAutopost: parseIntStat(stats.readyForAutopost),
    weeklyGoal: parseIntStat(stats.weeklyGoal),
    weeklyAvailable: parseIntStat(stats.weeklyAvailable),
    weeklyRaptor: parseIntStat(stats.weeklyRaptor),
    weeklyNonRaptor: parseIntStat(stats.weeklyNonRaptor),
    qcReviewed: parseIntStat(stats.qcReviewed),
    qcApproved: parseIntStat(stats.qcApproved),
    qcRejected: parseIntStat(stats.qcRejected),
    triageReviewed: parseIntStat(stats.triageReviewed),
    triageNoPost: parseFloatStat(stats.triageNoPost),
    triagePlatformPost: parseFloatStat(stats.triagePlatformPost),
    triageStuck: parseFloatStat(stats.triageStuck),
    triageReshoots: parseFloatStat(stats.triageReshoots),
  };

  const goalProgress = numericStats.weeklyGoal > 0 ? (numericStats.weeklyAvailable / numericStats.weeklyGoal) * 100 : 0;

  const galleryStatusData = [
    { name: 'Delivered', value: numericStats.raptorDelivered, color: '#10b981' },
    { name: 'In Progress', value: numericStats.inProgress, color: '#f59e0b' },
    { name: 'Ready for Post', value: numericStats.readyForAutopost, color: '#0d9488' },
    { name: 'Available', value: numericStats.weeklyAvailable, color: '#818cf8' },
    { name: 'Failed', value: numericStats.failed, color: '#ef4444' },
  ];

  const goalData = [
    { name: 'Available', value: numericStats.weeklyAvailable, color: '#6366f1' },
    { name: 'Remaining', value: Math.max(0, numericStats.weeklyGoal - numericStats.weeklyAvailable), color: '#e2e8f0' }
  ];

  const triageData = [
    { name: 'Required Platform Post Fixes', value: numericStats.triageReviewed * (numericStats.triagePlatformPost / 100), color: '#3b82f6' },
    { name: 'Required No Post Fixes', value: numericStats.triageReviewed * (numericStats.triageNoPost / 100), color: '#14b8a6' },
    { name: 'Stuck', value: numericStats.triageReviewed * (numericStats.triageStuck / 100), color: '#f97316' },
    { name: 'Reshoots Requested', value: numericStats.triageReviewed * (numericStats.triageReshoots / 100), color: '#ef4444' },
  ];

  const qcChartData = [
      { name: 'Approved', value: numericStats.qcApproved, color: '#10b981' },
      { name: 'Rejected', value: numericStats.qcRejected, color: '#ef4444' },
  ];

  // Combined Triage/QC calculations
  const triageNoPostFixesValue = numericStats.triageReviewed * (numericStats.triageNoPost / 100);
  const triagePlatformPostFixesValue = numericStats.triageReviewed * (numericStats.triagePlatformPost / 100);
  const triageRejectedValue = numericStats.triageReviewed * ((numericStats.triageStuck + numericStats.triageReshoots) / 100);

  const combinedReviewed = numericStats.qcReviewed + numericStats.triageReviewed;
  
  const approvedNoPostWork = numericStats.qcApproved + triageNoPostFixesValue;
  const approvedWithPostWork = triagePlatformPostFixesValue;
  const combinedRejected = numericStats.qcRejected + triageRejectedValue;

  const combinedChartData = [
      { name: 'Approved - No Post Work', value: approvedNoPostWork, color: '#22c55e' },
      { name: 'Approved - With Post Work', value: approvedWithPostWork, color: '#84cc16' },
      { name: 'Total Rejected', value: combinedRejected, color: '#ef4444' },
  ];


  const handleDownloadPDF = async () => {
    const elementToCapture = dashboardRef.current;
    if (!elementToCapture) {
        console.error("Dashboard element not found for capture.");
        return;
    }
    
    if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      console.error('PDF generation libraries not loaded.');
      alert('Sorry, the PDF download feature is currently unavailable. Please try refreshing the page.');
      return;
    }

    setIsDownloading(true);

    try {
        const { jsPDF } = window.jspdf;
        const canvas = await window.html2canvas(elementToCapture, {
            scale: 2,
            useCORS: true,
            onclone: (document) => {
                const clonedButton = document.getElementById('download-pdf-btn');
                if (clonedButton) {
                    clonedButton.style.display = 'none';
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasAspectRatio = canvas.height / canvas.width;
        const imgHeight = pdfWidth * canvasAspectRatio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save("dashboard-report.pdf");
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, an error occurred while generating the PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  const TabButton = ({ tabName, label, Icon, onClick }: { tabName: string, label: string, Icon: React.ElementType, onClick?: () => void }) => (
    <button
      onClick={onClick || (() => setActiveTab(tabName))}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        activeTab === tabName
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-2">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">Product & Gallery Dashboard</h1>
                {isAdmin && (
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                )}
            </div>
        </header>

        <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
                <TabButton tabName="raptorDashboard" label="Raptor Dashboard" Icon={Target} />
                <TabButton tabName="ticketTriageDashboard" label="Ticket Triage / QC Dashboard" Icon={ClipboardCheck} />
                {isAdmin && (
                  <TabButton tabName="data" label="Data Input" Icon={Edit} />
                )}
            </nav>
        </div>
        
        <div className="mt-6">
            {activeTab === 'raptorDashboard' && (
                <div ref={dashboardRef}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <p className="text-base lg:text-lg text-slate-600 mb-4 sm:mb-0">
                            Total Experiences in System: <span className="font-bold text-slate-800">{numericStats.totalExperiences.toLocaleString()}</span>
                        </p>
                        <button
                            id="download-pdf-btn"
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            <Download className="w-5 h-5" />
                            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard title="Total Products Captured" value={numericStats.totalProducts} borderColor="border-blue-500" />
                        <StatCard title="Total Galleries Generated" value={numericStats.totalGalleries} borderColor="border-purple-500" />
                        <StatCard title="Raptor Galleries Delivered" value={numericStats.raptorDelivered} borderColor="border-green-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Raptor Gallery Delivery Status</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                      data={galleryStatusData} 
                                      cx="50%" 
                                      cy="50%" 
                                      labelLine={false} 
                                      label={false}
                                      outerRadius={120} 
                                      fill="#8884d8" 
                                      dataKey="value"
                                    >
                                        {galleryStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mb-3 pb-3 border-b border-slate-200">
                                <p className="text-sm text-slate-600 text-center">Total Products Captured: <span className="font-bold text-slate-800">{numericStats.totalProducts.toLocaleString()}</span></p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {galleryStatusData.map((item, idx) => {
                                    const percentage = numericStats.totalProducts > 0 ? (item.value / numericStats.totalProducts * 100).toFixed(1) : '0.0';
                                    return (
                                        <div key={idx} className="flex items-start">
                                            <div className="w-4 h-4 rounded mr-2 flex-shrink-0" style={{ backgroundColor: item.color, marginTop: '0.25rem' }}></div>
                                            <div>
                                                <span className="text-sm text-slate-600 block">{item.name}: <span className="font-semibold">{item.value.toLocaleString()} ({percentage}%)</span></span>
                                                {item.name === 'In Progress' && (<p className="text-xs text-slate-500">Some may be stuck</p>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
                            <div className="flex items-center mb-4"><Target className="w-8 h-8 text-indigo-500 mr-3" /><h2 className="text-2xl font-bold text-slate-800">Weekly Raptor Delivery</h2></div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="relative flex justify-center items-center">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={goalData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} fill="#8884d8" paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                                                {goalData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute flex flex-col items-center justify-center"><p className="text-3xl font-bold text-indigo-600">{goalProgress.toFixed(1)}%</p><p className="text-sm text-slate-600">of Goal</p></div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="grid grid-cols-1 gap-3">
                                        <GoalStat label="Raptor Goal" value={numericStats.weeklyGoal} />
                                        <GoalStat label="Available Galleries" value={numericStats.weeklyAvailable} />
                                        <GoalStat label="Remaining to Goal" value={Math.max(0, numericStats.weeklyGoal - numericStats.weeklyAvailable)} isHighlighted={true} />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(goalProgress, 100)}%` }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-slate-200">
                                <BreakdownStat label="Raptor Galleries" value={numericStats.weeklyRaptor} />
                                <BreakdownStat label="Non-Raptor Galleries" value={numericStats.weeklyNonRaptor} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ticketTriageDashboard' && (
                <div ref={dashboardRef}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <p className="text-base lg:text-lg text-slate-600 mb-4 sm:mb-0">
                            Weekly Triage and Quality Control Overview
                        </p>
                        <button
                            id="download-pdf-btn"
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            <Download className="w-5 h-5" />
                            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Combined Weekly Review Overview</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={combinedChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {combinedChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number, name, props) => {
                                    const total = combinedChartData.reduce((acc, curr) => acc + curr.value, 0);
                                    const percentage = total > 0 ? (value / total * 100).toFixed(1) : '0.0';
                                    return `${percentage}%`;
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mb-3 pb-3 border-b border-slate-200">
                            <p className="text-sm text-slate-600 text-center">Total Galleries Reviewed (Combined): <span className="font-bold text-slate-800">{combinedReviewed.toLocaleString()}</span></p>
                        </div>
                        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 pt-2">
                           {combinedChartData.map((item, idx) => {
                                const percentage = combinedReviewed > 0 ? (item.value / combinedReviewed * 100).toFixed(1) : '0.0';
                                return (
                                    <div key={idx} className="flex items-center">
                                        <div className="w-4 h-4 rounded mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                        <div>
                                            <span className="text-sm text-slate-600">{item.name}: <span className="font-semibold">{percentage}%</span></span>
                                        </div>
                                    </div>
                                );
                           })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">QC App weekly</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={qcChartData} cx="50%" cy="50%" labelLine={false} label={false} outerRadius={100} fill="#8884d8" dataKey="value">
                                        {qcChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} (${(value / numericStats.qcReviewed * 100).toFixed(1)}%)`} />
                                </PieChart>
                            </ResponsiveContainer>
                             <div className="space-y-2 mt-4">
                                <QcStat
                                    label="Galleries reviewed"
                                    value={numericStats.qcReviewed}
                                />
                                <QcStat
                                    label="Galleries approved"
                                    value={numericStats.qcApproved}
                                    total={numericStats.qcReviewed}
                                    color="text-green-600"
                                />
                                <QcStat
                                    label="Galleries rejected"
                                    value={numericStats.qcRejected}
                                    total={numericStats.qcReviewed}
                                    color="text-red-600"
                                />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Ticket Triage weekly</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={triageData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {triageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${Math.round(value).toLocaleString()} (${(value / numericStats.triageReviewed * 100).toFixed(1)}%)`} />
                                </PieChart>
                            </ResponsiveContainer>
                             <div className="mb-3 pb-3 border-b border-slate-200">
                                <p className="text-sm text-slate-600 text-center">Total Galleries Reviewed: <span className="font-bold text-slate-800">{numericStats.triageReviewed.toLocaleString()}</span></p>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {triageData.map((item, idx) => {
                                    const percentage = numericStats.triageReviewed > 0 ? (item.value / numericStats.triageReviewed * 100).toFixed(1) : '0.0';
                                    return (
                                        <div key={idx} className="flex items-start">
                                            <div className="w-4 h-4 rounded mr-2 flex-shrink-0" style={{ backgroundColor: item.color, marginTop: '0.25rem' }}></div>
                                            <div>
                                                <span className="text-sm text-slate-600 block">{item.name}: <span className="font-semibold">{percentage}%</span></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {isAdmin && activeTab === 'data' && (
                <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Edit Dashboard Data</h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 -mt-4">
                        The values below power the dashboard. Any changes you make here will be reflected on the charts in real-time and saved automatically.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
                            <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-slate-700 mb-1">
                                  {statLinks[key] ? (
                                    <a href={statLinks[key]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                      {statLabels[key]}
                                    </a>
                                  ) : (
                                    statLabels[key]
                                  )}
                                </label>
                                <input
                                    type="text"
                                    name={key}
                                    id={key}
                                    value={stats[key]}
                                    onChange={handleStatChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Helper components defined outside the main component body to prevent re-rendering issues
interface StatCardProps { title: string; value: number; borderColor: string; }
const StatCard: React.FC<StatCardProps> = ({ title, value, borderColor }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${borderColor}`}>
    <p className="text-sm font-medium text-slate-600 mb-1 truncate">{title}</p>
    <p className="text-3xl font-bold text-slate-800">{value.toLocaleString()}</p>
  </div>
);

interface GoalStatProps { label: string; value: number; isHighlighted?: boolean; }
const GoalStat: React.FC<GoalStatProps> = ({ label, value, isHighlighted }) => (
    <div className={`${isHighlighted ? 'bg-indigo-50' : 'bg-slate-50'} rounded-lg p-3`}>
        <p className={`text-xs font-medium ${isHighlighted ? 'text-indigo-700' : 'text-slate-600'} mb-1`}>{label}</p>
        <p className={`text-xl font-bold ${isHighlighted ? 'text-indigo-800' : 'text-slate-800'}`}>{value.toLocaleString()}</p>
    </div>
);

interface BreakdownStatProps { label: string; value: number; }
const BreakdownStat: React.FC<BreakdownStatProps> = ({ label, value }) => (
    <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value.toLocaleString()}</p>
    </div>
);

interface QcStatProps { label: string; value: number; total?: number; color?: string; }
const QcStat: React.FC<QcStatProps> = ({ label, value, total, color = 'text-slate-800' }) => {
    const percentage = total && total > 0 ? (value / total * 100).toFixed(1) : '0.0';
    return (
        <div className="flex justify-between items-baseline bg-slate-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-lg font-bold text-slate-800">
                {value.toLocaleString()}
                {total && <span className={`text-sm font-normal ml-2 ${color}`}>({percentage}%)</span>}
            </p>
        </div>
    );
};
