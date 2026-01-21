import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Key, ClipboardList, CheckCircle, AlertCircle, Shield, User, FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function Reports() {
  const { userAccounts, keys, tasks, generatedReports, addGeneratedReport } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const supervisorCount = userAccounts.filter(a => a.role === 'supervisor').length;
  const staffCount = userAccounts.filter(a => a.role === 'staff').length;
  const availableKeys = keys.filter((k) => k.status === 'Available').length;
  const assignedKeys = keys.filter((k) => k.status === 'Assigned').length;

  const stats = [
    {
      label: 'Total Accounts',
      value: userAccounts.length,
      description: `${supervisorCount} supervisors, ${staffCount} staff`,
      icon: <Users className="h-6 w-6" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Keys',
      value: keys.length,
      description: 'Keys in the system',
      icon: <Key className="h-6 w-6" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Tasks',
      value: tasks.length,
      description: 'Active tasks',
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const keyBreakdown = [
    {
      label: 'Available Keys',
      value: availableKeys,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-success',
    },
    {
      label: 'Assigned Keys',
      value: assignedKeys,
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-warning',
    },
  ];

  const generateReport = () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const now = new Date();
      const reportName = `Report_${now.toISOString().split('T')[0]}_${now.getHours()}${now.getMinutes()}`;
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Management System Report', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${now.toLocaleString()}`, 20, 30);
      
      // Summary Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, 45);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Accounts: ${userAccounts.length} (${supervisorCount} supervisors, ${staffCount} staff)`, 25, 55);
      doc.text(`Total Keys: ${keys.length} (${availableKeys} available, ${assignedKeys} assigned)`, 25, 62);
      doc.text(`Total Active Tasks: ${tasks.length}`, 25, 69);
      
      // Keys Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Keys List', 20, 85);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Number', 25, 95);
      doc.text('Description', 60, 95);
      doc.text('Status', 120, 95);
      doc.text('Assigned To', 150, 95);
      
      doc.setFont('helvetica', 'normal');
      let yPos = 102;
      keys.forEach((key) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(key.keyNumber, 25, yPos);
        doc.text(key.description.substring(0, 25), 60, yPos);
        doc.text(key.status, 120, yPos);
        doc.text(key.assignedToName || '-', 150, yPos);
        yPos += 7;
      });
      
      // Tasks Section
      yPos += 10;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tasks List', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Name', 25, yPos);
      doc.text('Assigned To', 80, yPos);
      doc.text('Key', 130, yPos);
      doc.text('Due Date', 160, yPos);
      
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      tasks.forEach((task) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(task.taskName.substring(0, 25), 25, yPos);
        doc.text(task.assignedTo, 80, yPos);
        doc.text(task.keyNumber, 130, yPos);
        doc.text(task.dueDate, 160, yPos);
        yPos += 7;
      });
      
      // User Directory Section
      yPos += 10;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('User Directory', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 25, yPos);
      doc.text('Role', 80, yPos);
      doc.text('Email', 120, yPos);
      
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      userAccounts.forEach((account) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(account.name, 25, yPos);
        doc.text(account.role.charAt(0).toUpperCase() + account.role.slice(1), 80, yPos);
        doc.text(account.email, 120, yPos);
        yPos += 7;
      });
      
      // Save and store the PDF
      const pdfData = doc.output('datauristring');
      
      addGeneratedReport({
        name: reportName,
        generatedAt: now.toISOString(),
        data: pdfData,
      });
      
      // Also trigger download
      doc.save(`${reportName}.pdf`);
      
      toast.success('Report generated and downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: typeof generatedReports[0]) => {
    const link = document.createElement('a');
    link.href = report.data;
    link.download = `${report.name}.pdf`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="mt-1 text-muted-foreground">View system summary and statistics</p>
          </div>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Report
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="animate-slide-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{stat.label}</CardTitle>
                  <CardDescription>{stat.description}</CardDescription>
                </div>
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Keys Breakdown</CardTitle>
            <CardDescription>Status distribution of registered keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {keyBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-lg bg-muted/50 p-4"
                >
                  <span className={item.color}>{item.icon}</span>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>Quick overview of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {userAccounts.length === 0 ? (
              <p className="text-muted-foreground">No users registered yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                      account.role === 'supervisor' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {account.role === 'supervisor' ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{account.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>Previously generated PDF reports</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedReports.length === 0 ? (
              <p className="text-muted-foreground">No reports generated yet. Click "Generate Report" to create one.</p>
            ) : (
              <div className="space-y-2">
                {generatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{report.name}.pdf</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
