import MortgageModel from '../model/MortgageModel.js';

/**
 * Mortgage Presenter
 * ローンシミュレーションのビジネスロジック
 */
export default class MortgagePresenter {
  constructor() {
    this.model = new MortgageModel();
    this.error = null;
    this.simulationHistory = [];
  }

  normalizeMortgageData(mortgageData) {
    return {
      principalAmount: Number(mortgageData?.principalAmount),
      currentBalanceAmount: Number(mortgageData?.currentBalanceAmount),
      loanYears: Number(mortgageData?.loanYears),
      remainingYears: Number(mortgageData?.remainingYears),
      annualRate: Number(mortgageData?.annualRate),
      interestType: String(mortgageData?.interestType ?? 'fixed'),
      repaymentType: String(mortgageData?.repaymentType ?? 'equal'),
      monthlyPaymentAmount: Number(mortgageData?.monthlyPaymentAmount ?? 0),
      bonusPaymentAmount: Number(mortgageData?.bonusPaymentAmount ?? 0),
      prepaymentAmount: Number(mortgageData?.prepaymentAmount ?? 0),
      prepaymentYear: Number(mortgageData?.prepaymentYear ?? 1),
      prepaymentType: String(mortgageData?.prepaymentType ?? 'term_reduction'),
      refinanceRate: Number(mortgageData?.refinanceRate ?? 0),
      refinanceCost: Number(mortgageData?.refinanceCost ?? 0)
    };
  }

  /**
   * ローンシミュレーションを実行
   * @param {Object} mortgageData - ローン情報
   * @returns {Object} シミュレーション結果
   */
  handleMortgageSubmit(mortgageData) {
    try {
      this.error = null;
      const safeMortgageData = this.normalizeMortgageData(mortgageData);
      const result = this.model.simulate(safeMortgageData);

      // 履歴に保存
      this.simulationHistory.unshift({
        ...safeMortgageData,
        timestamp: new Date(),
        result: result.summary
      });

      return {
        success: true,
        result
      };
    } catch (error) {
      this.error = error.message;
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * エラーを取得
   * @returns {string|null} エラーメッセージ
   */
  getError() {
    return this.error;
  }

  /**
   * エラーをクリア
   */
  clearError() {
    this.error = null;
  }

  /**
   * シミュレーション履歴を取得
   * @returns {Array} 履歴配列
   */
  getHistory() {
    return this.simulationHistory;
  }

  /**
   * シミュレーション履歴をクリア
   */
  clearHistory() {
    this.simulationHistory = [];
  }

  /**
   * 履歴から1件削除
   * @param {number} index - 削除するインデックス
   */
  deleteHistoryItem(index) {
    if (index >= 0 && index < this.simulationHistory.length) {
      this.simulationHistory.splice(index, 1);
    }
  }
}