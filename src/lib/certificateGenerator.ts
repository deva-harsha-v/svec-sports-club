import jsPDF from 'jspdf';
import { Certificate } from './types';

export const downloadCertificatePdf = (cert: Certificate) => {
  // Landscape A4 certificate (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background: Deep obsidian/navy sports canvas
  doc.setFillColor(7, 10, 15);
  doc.rect(0, 0, width, height, 'F');

  // Outer Gold/Lime Double Border
  doc.setDrawColor(184, 255, 61); // Electric Lime
  doc.setLineWidth(1.5);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setDrawColor(255, 184, 0); // Gold inner line
  doc.setLineWidth(0.6);
  doc.rect(12, 12, width - 24, height - 24);

  // Corner Accent Brackets
  const cornerSize = 15;
  doc.setDrawColor(184, 255, 61);
  doc.setLineWidth(3);
  // Top-left
  doc.line(8, 8, 8 + cornerSize, 8);
  doc.line(8, 8, 8, 8 + cornerSize);
  // Top-right
  doc.line(width - 8, 8, width - 8 - cornerSize, 8);
  doc.line(width - 8, 8, width - 8, 8 + cornerSize);
  // Bottom-left
  doc.line(8, height - 8, 8 + cornerSize, height - 8);
  doc.line(8, height - 8, 8, height - 8 - cornerSize);
  // Bottom-right
  doc.line(width - 8, height - 8, width - 8 - cornerSize, height - 8);
  doc.line(width - 8, height - 8, width - 8, height - 8 - cornerSize);

  // Header: SRI VASAVI SPORTS CLUB
  doc.setTextColor(184, 255, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SRI VASAVI SPORTS CLUB', width / 2, 32, { align: 'center' });

  doc.setTextColor(139, 149, 167);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('SRI VASAVI ENGINEERING COLLEGE // ATHLETIC EXCELLENCE', width / 2, 40, { align: 'center' });

  // Divider
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 60, 45, width / 2 + 60, 45);

  // Subtitle
  doc.setTextColor(245, 247, 250);
  doc.setFontSize(13);
  doc.text('THIS IS PROUDLY PRESENTED TO', width / 2, 60, { align: 'center' });

  // Recipient Athlete Name
  doc.setTextColor(184, 255, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(cert.athlete_name.toUpperCase(), width / 2, 78, { align: 'center' });

  // Recipient Underline
  doc.setDrawColor(184, 255, 61);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - 70, 83, width / 2 + 70, 83);

  // Body Narrative
  doc.setTextColor(220, 226, 235);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  const narrative = `for outstanding sportsmanship, competitive drive, and distinguished performance as`;
  doc.text(narrative, width / 2, 96, { align: 'center' });

  // Achievement / Rank Badge
  doc.setTextColor(255, 184, 0); // Gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(cert.rank_achieved.toUpperCase(), width / 2, 108, { align: 'center' });

  doc.setTextColor(245, 247, 250);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`in the ${cert.tournament_title} (${cert.sport_name})`, width / 2, 120, { align: 'center' });

  // Gold Seal Graphic
  const sealX = width / 2;
  const sealY = 145;
  doc.setFillColor(20, 26, 38);
  doc.setDrawColor(255, 184, 0);
  doc.setLineWidth(1.2);
  doc.circle(sealX, sealY, 14, 'FD');

  doc.setTextColor(255, 184, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VERIFIED', sealX, sealY - 2, { align: 'center' });
  doc.setFontSize(7);
  doc.text('ATHLETE', sealX, sealY + 3, { align: 'center' });

  // Signatures
  const sigY = 175;
  // Left: Sports Director
  doc.setDrawColor(139, 149, 167);
  doc.setLineWidth(0.5);
  doc.line(40, sigY, 100, sigY);
  doc.setTextColor(245, 247, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('COACH MARCUS STERLING', 70, sigY + 6, { align: 'center' });
  doc.setTextColor(139, 149, 167);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Director of Athletics', 70, sigY + 11, { align: 'center' });

  // Right: Dean of Student Affairs
  doc.setDrawColor(139, 149, 167);
  doc.setLineWidth(0.5);
  doc.line(width - 100, sigY, width - 40, sigY);
  doc.setTextColor(245, 247, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DR. ARLO CHEN, PH.D.', width - 70, sigY + 6, { align: 'center' });
  doc.setTextColor(139, 149, 167);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Dean of Student Affairs', width - 70, sigY + 11, { align: 'center' });

  // Footer Metadata
  doc.setTextColor(100, 116, 139);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text(`CERTIFICATE ID: ${cert.certificate_no}`, 16, height - 12);
  doc.text(`ISSUED: ${cert.issue_date}`, width / 2, height - 12, { align: 'center' });
  doc.text(`HASH: ${cert.verification_hash.substring(0, 16)}...`, width - 16, height - 12, { align: 'right' });

  // Save to file
  doc.save(`${cert.certificate_no}_${cert.athlete_name.replace(/\s+/g, '_')}.pdf`);
};
