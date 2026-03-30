/**
 * Utility to generate downloadable reports for student performance.
 * This can be expanded to generate real PDF/Excel in the future.
 */

export const generateStudentReport = (studentData) => {
    if (!studentData) return null;

    const headers = ["Student Name", "Group", "Overall Accuracy", "Total Sessions", "Last Active"];
    const rows = studentData.map(student => [
        student.name,
        student.group,
        student.accuracy,
        student.sessions,
        student.lastActive
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    return {
        url,
        filename: `Akabando_Atlas_Report_${new Date().toISOString().split('T')[0]}.csv`
    };
};

export const downloadFile = (url, filename) => {
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
