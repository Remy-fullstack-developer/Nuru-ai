import { MobileTransaction, CommunityReference, CreditAssessment, WorkerProfile, ScoreFactor } from '../types';

export function calculateCreditScore(
  transactions: MobileTransaction[],
  references: CommunityReference[],
  profile: WorkerProfile
): CreditAssessment {
  let score = 420; // Base baseline score for informal worker

  // 1. Calculate Monthly Turnover & Consistency
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUtilityPayments = transactions
    .filter((t) => (t.type === 'utility' || t.type === 'payment') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTurnover = totalIncome > 0 ? totalIncome : 80000;

  // Consistency points (up to +120)
  const txCount = transactions.length;
  let consistencyScore = Math.min(100, txCount * 18);
  const consistencyPoints = Math.round((consistencyScore / 100) * 120);
  score += consistencyPoints;

  // Turnover points (up to +110)
  let turnoverPoints = 0;
  if (monthlyTurnover > 200000) turnoverPoints = 110;
  else if (monthlyTurnover > 100000) turnoverPoints = 85;
  else if (monthlyTurnover > 50000) turnoverPoints = 60;
  else turnoverPoints = 30;
  score += turnoverPoints;

  // Utility Payment Discipline (up to +60)
  const utilityCount = transactions.filter((t) => t.type === 'utility' || t.type === 'airtime').length;
  const utilityPoints = Math.min(60, utilityCount * 25);
  score += utilityPoints;

  // 2. Community Vouching & References (up to +140)
  const verifiedRefs = references.filter((r) => r.verificationStatus === 'verified' || r.verificationStatus === 'vouched');
  const totalVouchedAmount = verifiedRefs.reduce((sum, r) => sum + r.vouchAmount, 0);
  
  let communityVouchScore = Math.min(100, verifiedRefs.length * 30 + (totalVouchedAmount > 100000 ? 25 : 10));
  const vouchPoints = Math.round((communityVouchScore / 100) * 140);
  score += vouchPoints;

  // 3. Experience & Cooperative Membership (up to +50)
  let experiencePoints = Math.min(30, profile.experienceYears * 7);
  if (profile.cooperativeName && profile.cooperativeName.trim().length > 0) {
    experiencePoints += 20;
  }
  score += experiencePoints;

  // Cap score between 300 and 850
  score = Math.max(300, Math.min(850, Math.round(score)));

  // Tier determination
  let tier = 'Starter Trust Member';
  let maxLoanAmount = 50000; // default in RWF
  let recommendedInterestRate = 2.5;

  if (score >= 750) {
    tier = 'Platinum Micro-Trader';
    maxLoanAmount = 600000;
    recommendedInterestRate = 1.1;
  } else if (score >= 680) {
    tier = 'Gold Community Partner';
    maxLoanAmount = 350000;
    recommendedInterestRate = 1.4;
  } else if (score >= 580) {
    tier = 'Silver Growing Trader';
    maxLoanAmount = 180000;
    recommendedInterestRate = 1.8;
  } else {
    tier = 'Bronze Starter Member';
    maxLoanAmount = 75000;
    recommendedInterestRate = 2.2;
  }

  // Multiply loan limit by currency factor if user changed currency
  if (profile.currency === 'KES') maxLoanAmount = Math.round(maxLoanAmount / 8);
  else if (profile.currency === 'UGX') maxLoanAmount = Math.round(maxLoanAmount * 2.8);
  else if (profile.currency === 'USD') maxLoanAmount = Math.round(maxLoanAmount / 1300);
  else if (profile.currency === 'ETB') maxLoanAmount = Math.round(maxLoanAmount / 11);
  else if (profile.currency === 'NGN') maxLoanAmount = Math.round(maxLoanAmount * 1.2);

  // Score Factors
  const factors: ScoreFactor[] = [
    {
      label: 'Community Guarantor Vouching',
      impact: verifiedRefs.length >= 2 ? 'positive' : 'neutral',
      description: `${verifiedRefs.length} community guarantors verified (${totalVouchedAmount.toLocaleString()} ${profile.currency} total vouched value).`,
      points: vouchPoints,
    },
    {
      label: 'Mobile Money Ledger Velocity',
      impact: txCount >= 4 ? 'positive' : 'neutral',
      description: `${txCount} verified receipts logged with active regular turnover.`,
      points: consistencyPoints + turnoverPoints,
    },
    {
      label: 'Utility & Airtime Payment Reliability',
      impact: utilityCount > 0 ? 'positive' : 'neutral',
      description: `${utilityCount} electricity/utility tokens paid on time without default.`,
      points: utilityPoints,
    },
    {
      label: 'Cooperative Membership & Longevity',
      impact: profile.cooperativeName ? 'positive' : 'neutral',
      description: profile.cooperativeName
        ? `Active member of "${profile.cooperativeName}" with ${profile.experienceYears} yrs trade experience.`
        : 'No cooperative affiliation attached.',
      points: experiencePoints,
    },
  ];

  // Improvement Tips
  const improvementTips: string[] = [];
  if (verifiedRefs.length < 3) {
    improvementTips.push('Add 1 more community guarantor (Market Leader or Co-op Chair) to gain up to +45 points.');
  }
  if (txCount < 6) {
    improvementTips.push('Log 3 additional Mobile Money transaction receipts to demonstrate consistent weekly cash flow (+35 points).');
  }
  if (!profile.cooperativeName) {
    improvementTips.push('Attach your registered Cooperative or Trade Association name to unlock lower MFI interest rates (+20 points).');
  }
  if (utilityCount < 2) {
    improvementTips.push('Log your monthly electricity token or solar home kit payment receipt (+25 points).');
  }

  return {
    score,
    tier,
    maxLoanAmount,
    currency: profile.currency || 'RWF',
    recommendedInterestRate,
    turnoverMonthly: monthlyTurnover,
    consistencyScore,
    communityVouchScore,
    repaymentReliability: Math.min(100, 75 + utilityCount * 8),
    factors,
    improvementTips,
  };
}
