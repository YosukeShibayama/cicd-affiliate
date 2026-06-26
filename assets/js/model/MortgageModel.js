/**
 * Mortgage Model
 * 住宅ローンの概算計算ロジック
 */
export default class MortgageModel {
  constructor() {
    this.scenarioRates = [1.0, 1.5, 2.0, 3.0];
  }

  simulate(input) {
    const data = this.normalize(input);
    this.validateInput(data);

    const principal = this.toYen(data.principalAmount);
    const currentBalance = data.currentBalanceAmount > 0 ? this.toYen(data.currentBalanceAmount) : principal;
    const loanMonths = data.loanYears * 12;
    const remainingMonths = data.remainingYears * 12;
    const bonusPayment = this.toYen(data.bonusPaymentAmount);

    const baseSchedule = this.buildSchedule({
      principal: currentBalance,
      annualRate: data.annualRate,
      months: remainingMonths,
      repaymentType: data.repaymentType,
      bonusPayment
    });

    const originalSchedule = this.buildSchedule({
      principal,
      annualRate: data.annualRate,
      months: loanMonths,
      repaymentType: data.repaymentType,
      bonusPayment
    });

    const scenarioComparison = this.buildScenarioComparison({
      principal: currentBalance,
      currentRate: data.annualRate,
      months: remainingMonths,
      repaymentType: data.repaymentType,
      bonusPayment,
      baseSchedule
    });

    const prepayment = this.buildPrepaymentComparison({
      data,
      principal: currentBalance,
      months: remainingMonths,
      repaymentType: data.repaymentType,
      bonusPayment,
      baseSchedule
    });

    const refinance = this.buildRefinanceComparison({
      data,
      principal: currentBalance,
      months: remainingMonths,
      bonusPayment,
      baseSchedule
    });

    const payoffDate = this.getPayoffDate(baseSchedule.schedule.length);

    return {
      success: true,
      input: data,
      repaymentType: data.repaymentType,
      interestType: data.interestType,
      principalAmount: principal,
      currentBalance,
      loanMonths,
      remainingMonths,
      monthlyPayment: baseSchedule.representativeMonthlyPayment,
      annualPayment: baseSchedule.representativeMonthlyPayment * 12 + bonusPayment,
      totalPayment: baseSchedule.totalPayment,
      totalInterest: baseSchedule.totalInterest,
      firstMonthPayment: baseSchedule.firstMonthPayment,
      lastMonthPayment: baseSchedule.lastMonthPayment,
      payoffDateLabel: payoffDate,
      schedule: baseSchedule.schedule,
      yearlyBalance: this.toYearlyBalance(baseSchedule.schedule),
      originalSummary: this.toSummary(originalSchedule),
      scenarioComparison,
      prepayment,
      refinance,
      summary: {
        monthlyPayment: baseSchedule.representativeMonthlyPayment,
        annualPayment: baseSchedule.representativeMonthlyPayment * 12 + bonusPayment,
        totalPayment: baseSchedule.totalPayment,
        totalInterest: baseSchedule.totalInterest,
        firstMonthPayment: baseSchedule.firstMonthPayment,
        lastMonthPayment: baseSchedule.lastMonthPayment,
        payoffDateLabel: payoffDate,
        remainingYearsLabel: this.formatMonths(baseSchedule.schedule.length),
        interestRate: ((baseSchedule.totalInterest / currentBalance) * 100).toFixed(2)
      }
    };
  }

  normalize(input) {
    return {
      principalAmount: Number(input?.principalAmount ?? 0),
      currentBalanceAmount: Number(input?.currentBalanceAmount ?? 0),
      loanYears: Number(input?.loanYears ?? 0),
      remainingYears: Number(input?.remainingYears ?? 0),
      annualRate: Number(input?.annualRate ?? 0),
      interestType: String(input?.interestType ?? 'fixed'),
      repaymentType: String(input?.repaymentType ?? 'equal'),
      monthlyPaymentAmount: Number(input?.monthlyPaymentAmount ?? 0),
      bonusPaymentAmount: Number(input?.bonusPaymentAmount ?? 0),
      prepaymentAmount: Number(input?.prepaymentAmount ?? 0),
      prepaymentYear: Number(input?.prepaymentYear ?? 1),
      prepaymentType: String(input?.prepaymentType ?? 'term_reduction'),
      refinanceRate: Number(input?.refinanceRate ?? 0),
      refinanceCost: Number(input?.refinanceCost ?? 0)
    };
  }

  validateInput(data) {
    const errors = [];
    const finiteFields = [
      ['借入額', data.principalAmount],
      ['現在残債', data.currentBalanceAmount],
      ['借入期間', data.loanYears],
      ['残り返済期間', data.remainingYears],
      ['金利', data.annualRate],
      ['毎月返済額', data.monthlyPaymentAmount],
      ['ボーナス返済額', data.bonusPaymentAmount],
      ['繰上返済額', data.prepaymentAmount],
      ['繰上返済時期', data.prepaymentYear],
      ['借り換え後金利', data.refinanceRate],
      ['借り換え諸費用', data.refinanceCost]
    ];

    finiteFields.forEach(([label, value]) => {
      if (!Number.isFinite(value)) {
        errors.push(`${label}は数値で入力してください`);
      }
    });

    if (data.principalAmount <= 0 || data.principalAmount > 100000) {
      errors.push('借入額は1～100000万円で入力してください');
    }
    if (data.currentBalanceAmount < 0 || data.currentBalanceAmount > 100000) {
      errors.push('現在残債は0～100000万円で入力してください');
    }
    if (data.currentBalanceAmount > 0 && data.currentBalanceAmount > data.principalAmount) {
      errors.push('現在残債は借入額以下で入力してください');
    }
    if (!Number.isInteger(data.loanYears) || data.loanYears <= 0 || data.loanYears > 50) {
      errors.push('借入期間は1～50年の整数で入力してください');
    }
    if (!Number.isInteger(data.remainingYears) || data.remainingYears <= 0 || data.remainingYears > 50) {
      errors.push('残り返済期間は1～50年の整数で入力してください');
    }
    if (data.remainingYears > data.loanYears) {
      errors.push('残り返済期間は借入期間以下で入力してください');
    }
    if (data.annualRate < 0 || data.annualRate > 10) {
      errors.push('金利は0～10%で入力してください');
    }
    if (!['fixed', 'variable', 'mixed'].includes(data.interestType)) {
      errors.push('金利タイプを選択してください');
    }
    if (!['equal', 'principal'].includes(data.repaymentType)) {
      errors.push('返済方式を選択してください');
    }
    if (data.monthlyPaymentAmount < 0 || data.monthlyPaymentAmount > 1000) {
      errors.push('毎月返済額は0～1000万円で入力してください');
    }
    if (data.bonusPaymentAmount < 0 || data.bonusPaymentAmount > 2000) {
      errors.push('ボーナス返済額は0～2000万円で入力してください');
    }
    if (data.prepaymentAmount < 0 || data.prepaymentAmount > 100000) {
      errors.push('繰上返済額は0～100000万円で入力してください');
    }
    if (!Number.isInteger(data.prepaymentYear) || data.prepaymentYear < 1 || data.prepaymentYear > data.remainingYears) {
      errors.push('繰上返済時期は残り返済期間内の年数で入力してください');
    }
    if (!['term_reduction', 'payment_reduction'].includes(data.prepaymentType)) {
      errors.push('繰上返済タイプを選択してください');
    }
    if (data.refinanceRate < 0 || data.refinanceRate > 10) {
      errors.push('借り換え後金利は0～10%で入力してください');
    }
    if (data.refinanceCost < 0 || data.refinanceCost > 1000) {
      errors.push('借り換え諸費用は0～1000万円で入力してください');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('、'));
    }
  }

  buildSchedule({ principal, annualRate, months, repaymentType, bonusPayment = 0, prepayment = null }) {
    const monthlyRate = annualRate / 100 / 12;
    let balance = Math.max(0, Math.floor(principal));
    let totalPayment = 0;
    let totalInterest = 0;
    let currentMonthlyPayment = repaymentType === 'equal'
      ? Math.floor(this.calculateEqualPayment(balance, monthlyRate, months))
      : 0;
    let currentPrincipalPayment = repaymentType === 'principal'
      ? Math.max(1, Math.floor(balance / months))
      : 0;
    const halfBonus = Math.floor(bonusPayment / 2);
    const schedule = [];
    const prepaymentState = prepayment ? { ...prepayment, applied: false } : null;

    for (let month = 1; month <= months && balance > 0; month++) {
      const interest = Math.floor(balance * monthlyRate);
      let principalPayment;
      let regularPayment;

      if (repaymentType === 'equal') {
        principalPayment = Math.max(1, currentMonthlyPayment - interest);
        principalPayment = Math.min(balance, principalPayment);
        regularPayment = principalPayment + interest;
      } else {
        principalPayment = Math.min(balance, currentPrincipalPayment);
        regularPayment = principalPayment + interest;
      }

      balance -= principalPayment;
      let bonusApplied = 0;
      if (halfBonus > 0 && month % 6 === 0 && balance > 0) {
        bonusApplied = Math.min(balance, halfBonus);
        balance -= bonusApplied;
      }

      let prepaymentApplied = 0;
      if (prepaymentState && !prepaymentState.applied && month >= prepaymentState.month && balance > 0) {
        prepaymentApplied = Math.min(balance, prepaymentState.amount);
        balance -= prepaymentApplied;
        prepaymentState.applied = true;

        if (prepaymentState.type === 'payment_reduction' && balance > 0) {
          const remainingMonths = Math.max(1, months - month);
          currentMonthlyPayment = repaymentType === 'equal'
            ? Math.floor(this.calculateEqualPayment(balance, monthlyRate, remainingMonths))
            : 0;
          currentPrincipalPayment = repaymentType === 'principal'
            ? Math.max(1, Math.floor(balance / remainingMonths))
            : 0;
        }
      }

      const payment = regularPayment + bonusApplied + prepaymentApplied;
      totalPayment += payment;
      totalInterest += interest;

      schedule.push({
        month,
        year: Math.ceil(month / 12),
        payment,
        regularPayment,
        principal: principalPayment,
        interest,
        bonusPayment: bonusApplied,
        prepayment: prepaymentApplied,
        balance: Math.max(0, Math.floor(balance)),
        rate: annualRate.toFixed(2)
      });
    }

    const firstMonthPayment = schedule[0]?.regularPayment ?? 0;
    const lastMonthPayment = [...schedule].reverse().find(item => item.regularPayment > 0)?.regularPayment ?? 0;

    return {
      schedule,
      firstMonthPayment,
      lastMonthPayment,
      representativeMonthlyPayment: repaymentType === 'equal' ? firstMonthPayment : firstMonthPayment,
      totalPayment,
      totalInterest
    };
  }

  buildScenarioComparison({ principal, currentRate, months, repaymentType, bonusPayment, baseSchedule }) {
    const rates = [currentRate, ...this.scenarioRates.filter(rate => Math.abs(rate - currentRate) > 0.001)];
    return rates.map((rate, index) => {
      const schedule = this.buildSchedule({ principal, annualRate: rate, months, repaymentType, bonusPayment });
      const monthlyPayment = schedule.firstMonthPayment;
      const monthlyDiff = monthlyPayment - baseSchedule.firstMonthPayment;
      const totalIncrease = schedule.totalPayment - baseSchedule.totalPayment;
      return {
        label: index === 0 ? `現在金利 ${currentRate.toFixed(2)}%` : `${rate.toFixed(1)}%`,
        rate,
        monthlyPayment,
        monthlyDiff,
        annualDiff: monthlyDiff * 12,
        totalPayment: schedule.totalPayment,
        totalIncrease
      };
    });
  }

  buildPrepaymentComparison({ data, principal, months, repaymentType, bonusPayment, baseSchedule }) {
    if (data.prepaymentAmount <= 0) {
      return null;
    }

    const prepaymentMonth = Math.min(months, Math.max(1, data.prepaymentYear * 12));
    const prepaymentAmount = this.toYen(data.prepaymentAmount);
    const schedule = this.buildSchedule({
      principal,
      annualRate: data.annualRate,
      months,
      repaymentType,
      bonusPayment,
      prepayment: {
        month: prepaymentMonth,
        amount: prepaymentAmount,
        type: data.prepaymentType
      }
    });

    const baseMonths = baseSchedule.schedule.length;
    const afterMonths = schedule.schedule.length;
    const nextPayment = schedule.schedule.find(item => item.month > prepaymentMonth && item.regularPayment > 0)?.regularPayment ?? schedule.lastMonthPayment;

    return {
      type: data.prepaymentType,
      typeLabel: data.prepaymentType === 'term_reduction' ? '期間短縮型' : '返済額軽減型',
      amount: prepaymentAmount,
      month: prepaymentMonth,
      year: data.prepaymentYear,
      totalPayment: schedule.totalPayment,
      totalInterest: schedule.totalInterest,
      reducedInterest: Math.max(0, baseSchedule.totalInterest - schedule.totalInterest),
      shortenedMonths: Math.max(0, baseMonths - afterMonths),
      monthlyPaymentBefore: baseSchedule.firstMonthPayment,
      monthlyPaymentAfter: nextPayment,
      monthlyPaymentChange: nextPayment - baseSchedule.firstMonthPayment,
      schedule: schedule.schedule,
      yearlyBalance: this.toYearlyBalance(schedule.schedule)
    };
  }

  buildRefinanceComparison({ data, principal, months, bonusPayment, baseSchedule }) {
    if (data.refinanceRate <= 0 && data.refinanceCost <= 0) {
      return null;
    }

    const refinanceCost = this.toYen(data.refinanceCost);
    const afterSchedule = this.buildSchedule({
      principal,
      annualRate: data.refinanceRate,
      months,
      repaymentType: 'equal',
      bonusPayment
    });

    const monthlySaving = baseSchedule.firstMonthPayment - afterSchedule.firstMonthPayment;
    const annualSaving = monthlySaving * 12;
    const grossSaving = baseSchedule.totalPayment - afterSchedule.totalPayment;
    const netBenefit = grossSaving - refinanceCost;
    const paybackYears = annualSaving > 0 ? refinanceCost / annualSaving : null;

    return {
      currentRate: data.annualRate,
      refinanceRate: data.refinanceRate,
      refinanceCost,
      currentMonthlyPayment: baseSchedule.firstMonthPayment,
      afterMonthlyPayment: afterSchedule.firstMonthPayment,
      monthlySaving,
      annualSaving,
      grossSaving,
      netBenefit,
      paybackYears,
      totalPaymentAfterCost: afterSchedule.totalPayment + refinanceCost,
      schedule: afterSchedule.schedule,
      yearlyBalance: this.toYearlyBalance(afterSchedule.schedule)
    };
  }

  calculateEqualPayment(principal, monthlyRate, months) {
    if (monthlyRate === 0) {
      return principal / months;
    }
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return numerator / denominator;
  }

  toYearlyBalance(schedule) {
    const yearlyMap = new Map();
    schedule.forEach(item => {
      yearlyMap.set(item.year, item);
    });
    return [...yearlyMap.entries()].map(([year, item]) => ({
      year,
      balance: item.balance,
      totalPaidToYear: schedule
        .filter(payment => payment.year <= year)
        .reduce((sum, payment) => sum + payment.payment, 0)
    }));
  }

  toSummary(schedule) {
    return {
      monthlyPayment: schedule.firstMonthPayment,
      totalPayment: schedule.totalPayment,
      totalInterest: schedule.totalInterest,
      months: schedule.schedule.length
    };
  }

  getPayoffDate(months) {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return `${date.getFullYear()}年${date.getMonth() + 1}月ごろ`;
  }

  formatMonths(months) {
    const years = Math.floor(months / 12);
    const restMonths = months % 12;
    if (restMonths === 0) {
      return `約${years}年`;
    }
    return `約${years}年${restMonths}か月`;
  }

  toYen(value) {
    return Math.round(Number(value || 0) * 10000);
  }
}