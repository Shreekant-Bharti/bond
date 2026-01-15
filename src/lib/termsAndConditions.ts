import jsPDF from 'jspdf';

export const generateInvestorTermsPDF = (userName: string, userEmail: string): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = 20;
  const lineHeight = 6;
  const sectionGap = 10;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const addHeader = () => {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BONDFI INVESTOR', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    doc.text('TERMS & CONDITIONS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Document Generated: ${today}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text(`User: ${userName} (${userEmail})`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += sectionGap;
  };

  const addSectionTitle = (title: string) => {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    yPosition += lineHeight + 2;
  };

  const addParagraph = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 2;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const bulletText = `• ${text}`;
    const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
    lines.forEach((line: string, index: number) => {
      checkPageBreak(lineHeight);
      doc.text(index === 0 ? line : `  ${line}`, margin + 3, yPosition);
      yPosition += lineHeight;
    });
  };

  const checkPageBreak = (neededSpace: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (yPosition + neededSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
  };

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'This document is system-generated via BondFi. For educational and demonstration purposes only.',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    }
  };

  // Generate document
  addHeader();

  // SECTION 1
  addSectionTitle('SECTION 1: PLATFORM PURPOSE & NATURE');
  addParagraph(
    'BondFi is a digital platform designed to simulate fractional access to government-backed bond instruments. The platform provides a realistic demonstration of bond investment mechanics, portfolio management, and secondary market trading.'
  );
  addBullet('The platform is intended for educational, demonstration, and prototype purposes.');
  addBullet('All values, returns, yields, and simulations displayed are indicative and do not constitute actual financial products.');
  addBullet('BondFi does not hold any real funds, securities, or financial instruments on behalf of users.');
  addBullet('No actual monetary transactions occur through this platform.');
  yPosition += sectionGap;

  // SECTION 2
  addSectionTitle('SECTION 2: ELIGIBILITY & ACCOUNT USAGE');
  addParagraph(
    'By creating an account on BondFi, you acknowledge and agree to the following eligibility requirements and usage terms:'
  );
  addBullet('Users must provide accurate and complete information during account creation.');
  addBullet('Each account is individual, personal, and strictly non-transferable.');
  addBullet('Users must not share login credentials with any third party.');
  addBullet('BondFi reserves the right to restrict, suspend, or terminate access in case of misuse, suspicious activity, or violation of these terms (simulated enforcement).');
  addBullet('Multiple accounts per user are discouraged and may be flagged by the system.');
  yPosition += sectionGap;

  // SECTION 3
  addSectionTitle('SECTION 3: INVESTMENT & OWNERSHIP RULES');
  addParagraph(
    'Understanding the nature of bond investments on the BondFi platform:'
  );
  addBullet('Investors purchase fractional units of bonds represented digitally on the platform.');
  addBullet('Ownership reflects a digital representation only and does not confer legal title to any real security.');
  addBullet('Bond holdings are subject to availability and allocation rules defined at the time of listing.');
  addBullet('BondFi does not guarantee allocation in all cases due to simulated demand constraints.');
  addBullet('Fractional ownership enables participation with minimal investment amounts.');
  addBullet('All bond details including issuer, coupon rate, maturity date, and face value are simulated for demonstration.');
  yPosition += sectionGap;

  // SECTION 4
  addSectionTitle('SECTION 4: RETURNS & INTEREST POLICY');
  addParagraph(
    'The following terms govern interest and returns on bond investments:'
  );
  addBullet('Returns displayed on the platform are indicative and based on predefined yield assumptions.');
  addBullet('Interest (coupon payments) is applicable ONLY if the bond is held until its maturity date.');
  addBullet('Interest accrual is calculated based on the coupon rate and holding period.');
  addBullet('No interest is payable or credited for bonds sold before maturity on the secondary market.');
  addBullet('Maturity payouts include the principal amount plus total accrued interest for full-term holdings.');
  addBullet('Yield calculations are for illustrative purposes and do not guarantee actual returns.');
  yPosition += sectionGap;

  // SECTION 5 (CRITICAL)
  addSectionTitle('SECTION 5: EARLY EXIT & DEDUCTION RULES (CRITICAL)');
  addParagraph(
    'THIS SECTION CONTAINS CRITICAL INFORMATION ABOUT SELLING BONDS BEFORE MATURITY. PLEASE READ CAREFULLY.'
  );
  addParagraph('If an investor sells a bond before its maturity date, the following rules apply:');
  addBullet('The investor FORFEITS ALL future interest payments that would have been received if held to maturity.');
  addBullet('The principal amount is subject to a MANDATORY DEDUCTION based on fair market value calculation.');
  addBullet('Deduction is calculated using a Present Value (PV) discount formula considering:');
  addParagraph('    - Remaining tenure until maturity');
  addParagraph('    - Current market interest rate');
  addParagraph('    - Outstanding coupon value');
  addParagraph('    - Face value of the bond');
  addBullet('The discounted price becomes the FINAL selling value with no appeals or adjustments.');
  addBullet('Early exits MAY result in capital loss where you receive less than your original investment.');
  addBullet('An additional early exit penalty may be applied for bonds sold within the first 30 days of purchase.');
  addParagraph(
    'By agreeing to these terms, you acknowledge understanding that early sale of bonds will result in financial deductions and potential loss.'
  );
  yPosition += sectionGap;

  // SECTION 6
  addSectionTitle('SECTION 6: SECONDARY MARKET RULES');
  addParagraph(
    'The BondFi Secondary Market enables peer-to-peer bond trading between investors under the following conditions:'
  );
  addBullet('The secondary market allows resale of bonds between registered investors on the platform.');
  addBullet('Selling prices are SYSTEM-CALCULATED using fair market value algorithms and are non-negotiable.');
  addBullet('Sellers cannot set custom prices or override the calculated fair market value.');
  addBullet('BondFi does not guarantee immediate resale or liquidity for listed bonds.');
  addBullet('A sale transaction completes ONLY when another investor purchases the listed bond.');
  addBullet('Sellers receive payout ONLY after successful purchase completion by a buyer.');
  addBullet('Listings remain active until purchased or manually cancelled by the seller.');
  addBullet('Platform may delist bonds that remain unsold for extended periods.');
  yPosition += sectionGap;

  // SECTION 7
  addSectionTitle('SECTION 7: WALLET & SETTLEMENT');
  addParagraph(
    'The BondFi wallet system operates as follows:'
  );
  addBullet('Wallet balances are represented in simulated stablecoin values (USDT or INR equivalent).');
  addBullet('Funds credited to your wallet include bond sale proceeds and maturity payouts (simulated).');
  addBullet('Wallet deposits are simulated and do not involve real currency transfer.');
  addBullet('Withdrawals are processed via simulated bank transfer mechanisms.');
  addBullet('Processing times for deposits and withdrawals are indicative only.');
  addBullet('Wallet balance reflects available funds minus any pending transactions or holds.');
  yPosition += sectionGap;

  // SECTION 8
  addSectionTitle('SECTION 8: PAYOUT & WITHDRAWAL CONDITIONS');
  addParagraph(
    'Withdrawal and payout processing is subject to the following conditions:'
  );
  addBullet('Withdrawal requests are subject to internal verification checks and processing queues.');
  addBullet('Payouts may be delayed or declined in certain scenarios including:');
  addParagraph('    - Insufficient available balance');
  addParagraph('    - Pending transactions or holds');
  addParagraph('    - Account verification requirements');
  addParagraph('    - Technical processing delays');
  addBullet('Bank account details provided must be accurate and match the registered user name.');
  addBullet('BondFi is NOT responsible for failed transfers due to incorrect details provided by the user.');
  addBullet('Minimum withdrawal amounts may apply as defined in the platform settings.');
  yPosition += sectionGap;

  // SECTION 9
  addSectionTitle('SECTION 9: RISK DISCLOSURE');
  addParagraph(
    'IMPORTANT: All investments carry risk. By using BondFi, you acknowledge:'
  );
  addBullet('Bond investments involve market risk including interest rate risk and credit risk.');
  addBullet('Bond prices fluctuate based on interest rate movements and market conditions.');
  addBullet('When market interest rates rise, existing bond values typically decrease.');
  addBullet('Past performance does not indicate or guarantee future results.');
  addBullet('Capital is NOT guaranteed, especially in cases of early exit or secondary market sale.');
  addBullet('Simulated returns on BondFi may not reflect real-world bond market behavior.');
  addBullet('Users should not make real investment decisions based solely on BondFi simulations.');
  yPosition += sectionGap;

  // SECTION 10
  addSectionTitle('SECTION 10: DATA & PRIVACY');
  addParagraph(
    'BondFi handles user data according to the following guidelines:'
  );
  addBullet('User data is stored locally in your browser for demonstration purposes only.');
  addBullet('No real financial, personal, or sensitive data is processed or transmitted to external servers.');
  addBullet('Users consent to local storage usage for maintaining session and account information.');
  addBullet('Data persists only within your browser and can be cleared by clearing browser data.');
  addBullet('BondFi does not sell, share, or distribute user data to third parties.');
  addBullet('For demonstration purposes, data may be reset or cleared during platform updates.');
  yPosition += sectionGap;

  // SECTION 11
  addSectionTitle('SECTION 11: LIMITATION OF LIABILITY');
  addParagraph(
    'BondFi and its operators expressly disclaim liability as follows:'
  );
  addBullet('BondFi is NOT liable for any financial losses, real or simulated, arising from platform usage.');
  addBullet('Users participate at their own discretion and assume all associated risks.');
  addBullet('BondFi is not liable for misinterpretation of data, charts, returns, or projections displayed.');
  addBullet('Investment decisions should not be based solely on information from this demonstration platform.');
  addBullet('BondFi is not responsible for service interruptions, data loss, or technical failures.');
  addBullet('No warranties, express or implied, are provided regarding platform accuracy or availability.');
  addBullet('Users waive any claims against BondFi related to simulated investment outcomes.');
  yPosition += sectionGap;

  // SECTION 12
  addSectionTitle('SECTION 12: USER CONSENT & ACCEPTANCE');
  addParagraph(
    'By checking the Terms & Conditions checkbox and creating an account, the user confirms:'
  );
  addBullet('Complete understanding of all terms, conditions, and rules outlined in this document.');
  addBullet('Acceptance of all deductions, penalties, and fair market value calculations for early exits.');
  addBullet('Acknowledgment of all investment risks including potential capital loss.');
  addBullet('Agreement to platform behavior, policies, and system-enforced pricing mechanisms.');
  addBullet('Understanding that BondFi is for educational and demonstration purposes only.');
  addBullet('Consent to these terms being legally binding within the scope of platform usage.');
  yPosition += sectionGap;

  // Final acknowledgment
  checkPageBreak(40);
  yPosition += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACKNOWLEDGMENT OF TERMS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const ackText = `I, ${userName || '[User Name]'}, hereby acknowledge that I have read, understood, and agree to be bound by these Terms & Conditions. I understand that early sale of bonds will result in forfeiture of interest and deduction of principal. I accept all risks associated with using the BondFi platform.`;
  const ackLines = doc.splitTextToSize(ackText, contentWidth);
  ackLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 10;
  doc.text(`Date of Acceptance: ${today}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Email: ${userEmail || '[User Email]'}`, margin, yPosition);

  // Add footers to all pages
  addFooter();

  // Save the PDF
  doc.save(`BondFi_Terms_and_Conditions_${today.replace(/,?\s+/g, '_')}.pdf`);
};
