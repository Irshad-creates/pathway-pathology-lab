import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateLabReport = async (
  registration,
  testResults,
  labSettings,
) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Set colors
    const primaryColor = [25, 118, 210]; // Blue
    const textColor = [0, 0, 0];
    const lightGray = [240, 240, 240];

    // Header - Lab Name and Logo
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text(labSettings?.labName || "Pathology Lab", 15, 12);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("Clinical Laboratory Report", 15, 18);

    yPosition = 35;

    // Lab Details
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    const labDetails = [
      `Address: ${labSettings?.address || "Lab Address"}`,
      `Phone: ${labSettings?.phoneNumber || "+91-XXXXXXXXXX"}`,
      `Email: ${labSettings?.email || "lab@example.com"}`,
    ];

    labDetails.forEach((detail) => {
      doc.text(detail, 15, yPosition);
      yPosition += 4;
    });

    yPosition += 5;

    // Separator line
    doc.setDrawColor(...primaryColor);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Patient Information Section
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text("PATIENT INFORMATION", 15, yPosition);
    yPosition += 7;

    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    const patientInfo = [
      ["Name:", registration.patient?.name || "N/A"],
      [
        "Age/Gender:",
        `${registration.patient?.age || "N/A"} Years, ${registration.patient?.gender || "N/A"}`,
      ],
      ["Mobile:", registration.patient?.mobile || "N/A"],
      ["Email:", registration.patient?.email || "N/A"],
      ["Address:", registration.patient?.address || "N/A"],
      ["Lab Code:", registration.labCode || "N/A"],
      [
        "Registration Date:",
        new Date(registration.createdAt).toLocaleDateString() || "N/A",
      ],
    ];

    patientInfo.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, "normal");
      doc.text(value, 50, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Separator line
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Test Results Section
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text("TEST RESULTS", 15, yPosition);
    yPosition += 7;

    // Table header
    doc.setFillColor(...lightGray);
    doc.rect(15, yPosition - 3, pageWidth - 30, 6, "F");

    doc.setFont(undefined, "bold");
    doc.setFontSize(9);
    doc.text("Test Name", 15, yPosition);
    doc.text("Result", 100, yPosition);
    doc.text("Reference Range", 150, yPosition);

    yPosition += 8;

    // Table rows
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);

    if (registration.tests && registration.tests.length > 0) {
      registration.tests.forEach((test) => {
        const testName = test.testName || "N/A";
        const result = testResults[test.testName] || "Pending";
        const refRange = test.referenceRange || "N/A";

        // Wrap long text
        const testNameLines = doc.splitTextToSize(testName, 80);
        const resultLines = doc.splitTextToSize(result, 45);
        const refRangeLines = doc.splitTextToSize(refRange, 35);

        const maxLines = Math.max(
          testNameLines.length,
          resultLines.length,
          refRangeLines.length,
        );
        const lineHeight = 4;
        const rowHeight = maxLines * lineHeight + 2;

        // Alternate row colors
        if (Math.floor(yPosition / 10) % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(15, yPosition - 3, pageWidth - 30, rowHeight, "F");
        }

        doc.text(testNameLines, 15, yPosition);
        doc.text(resultLines, 100, yPosition);
        doc.text(refRangeLines, 150, yPosition);

        yPosition += rowHeight + 2;

        // Check if we need a new page - leave more space for signature
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 15;
        }
      });
    } else {
      doc.text("No tests recorded", 15, yPosition);
      yPosition += 8;
    }

    yPosition += 5;

    // Separator line
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Technician and Approval Section
    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("REPORT AUTHORIZATION", 15, yPosition);
    yPosition += 8;

    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    const approvalInfo = [
      `Technician: ${registration.technician || "N/A"}`,
      `Status: ${registration.status || "Completed"}`,
    ];

    approvalInfo.forEach((info) => {
      doc.text(info, 15, yPosition);
      yPosition += 5;
    });

    yPosition += 8;

    // Signature area - Single column centered
    const signatureLeftX = 15;
    const signatureLineY = yPosition;
    const signatureLineLength = 55;

    // Left signature box
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(
      signatureLeftX,
      signatureLineY,
      signatureLeftX + signatureLineLength,
      signatureLineY,
    );

    // Add signature image
    try {
      const signatureImg = "/signature.svg";
      doc.addImage(
        signatureImg,
        "SVG",
        signatureLeftX,
        signatureLineY - 8,
        40,
        12,
      );
    } catch (error) {
      // If image fails to load, just show text
      doc.setFontSize(12);
      doc.setFont(undefined, "italic");
      doc.text("Dr. Lab", signatureLeftX + 5, signatureLineY - 2);
    }

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("Authorized Signature", signatureLeftX, signatureLineY + 6);

    // Date below signature
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(9);
    doc.text(`Date: ${currentDate}`, signatureLeftX, signatureLineY + 15);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `This is a computer-generated report and is valid without signature.`,
      15,
      pageHeight - 10,
    );

    // Save the PDF
    const fileName = `${registration.labCode}_${registration.patient?.name?.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return {
      success: true,
      message: `Report generated successfully: ${fileName}`,
      fileName,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error generating report: ${error.message}`,
      error,
    };
  }
};

// Alternative: Generate report as HTML for preview
export const generateReportHTML = (registration, testResults, labSettings) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          background-color: #1976d2;
          color: white;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .section-title {
          background-color: #f5f5f5;
          padding: 10px;
          font-weight: bold;
          font-size: 14px;
          border-left: 4px solid #1976d2;
          margin-bottom: 10px;
        }
        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
        }
        .info-value {
          flex: 1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 2px solid #1976d2;
          font-size: 12px;
          color: #666;
          page-break-inside: avoid;
        }
        .signature-area {
          margin-top: 20px;
          display: block;
          page-break-inside: avoid;
        }
        .signature-box {
          text-align: center;
          padding: 0 20px;
        }
        .signature-line {
          margin-top: 20px;
          border-bottom: 2px solid #1976d2;
          padding: 20px 0 5px 0;
          min-height: 30px;
        }
        .signature-label {
          font-size: 11px;
          font-weight: bold;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${labSettings?.labName || "Pathology Lab"}</h1>
        <p>Clinical Laboratory Report</p>
      </div>

      <div class="section">
        <div class="section-title">LAB INFORMATION</div>
        <div class="info-row">
          <div class="info-label">Address:</div>
          <div class="info-value">${labSettings?.address || "Lab Address"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value">${labSettings?.phoneNumber || "+91-XXXXXXXXXX"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value">${labSettings?.email || "lab@example.com"}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PATIENT INFORMATION</div>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${registration.patient?.name || "N/A"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Age/Gender:</div>
          <div class="info-value">${registration.patient?.age || "N/A"} Years, ${registration.patient?.gender || "N/A"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Mobile:</div>
          <div class="info-value">${registration.patient?.mobile || "N/A"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Lab Code:</div>
          <div class="info-value">${registration.labCode || "N/A"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Registration Date:</div>
          <div class="info-value">${new Date(registration.createdAt).toLocaleDateString() || "N/A"}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">TEST RESULTS</div>
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Result</th>
              <th>Reference Range</th>
            </tr>
          </thead>
          <tbody>
            ${
              registration.tests
                ?.map(
                  (test) => `
              <tr>
                <td>${test.testName || "N/A"}</td>
                <td>${testResults[test.testName] || "Pending"}</td>
                <td>${test.referenceRange || "N/A"}</td>
              </tr>
            `,
                )
                .join("") || '<tr><td colspan="3">No tests recorded</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">REPORT AUTHORIZATION</div>
        <div class="info-row">
          <div class="info-label">Technician:</div>
          <div class="info-value">${registration.technician || "N/A"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Status:</div>
          <div class="info-value">${registration.status || "Completed"}</div>
        </div>
      </div>

      <div class="signature-area">
        <div class="signature-box">
          <div class="signature-line">_____________________</div>
          <div class="signature-label">Authorized Signature</div>
          <div class="signature-label" style="margin-top: 15px;">Date: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="footer">
        <p>This is a computer-generated report and is valid without signature.</p>
      </div>
    </body>
    </html>
  `;

  return html;
};

// Print preview - opens HTML in new window for printing
export const printLabReport = (registration, testResults, labSettings) => {
  try {
    const html = generateReportHTML(registration, testResults, labSettings);

    // Open in new window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then open print dialog
    printWindow.onload = () => {
      printWindow.print();
    };

    return {
      success: true,
      message: "Print preview opened successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Error opening print preview: ${error.message}`,
      error,
    };
  }
};
