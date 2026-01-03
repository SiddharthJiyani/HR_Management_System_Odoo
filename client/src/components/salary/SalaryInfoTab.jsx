import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Badge } from '../ui';
import { employeeAPI } from '../../services/api';

const SalaryInfoTab = ({ data, onUpdate, isAdmin = false, employeeId = null, onSaveSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  // Salary Configuration State
  const [salaryConfig, setSalaryConfig] = useState({
    monthlyWage: data?.monthlyWage || 50000,
    yearlyWage: data?.yearlyWage || 600000,
    workingDaysPerWeek: data?.workingDaysPerWeek || 5,
    breakTimeHours: data?.breakTimeHours || 1,
    
    // Salary Components (percentages of monthly wage or basic)
    components: data?.components || {
      basicSalary: { percentage: 50, computationType: 'percentage_of_wage' },
      houseRentAllowance: { percentage: 50, computationType: 'percentage_of_basic' },
      standardAllowance: { percentage: 16.67, computationType: 'percentage_of_basic' },
      performanceBonus: { percentage: 8.33, computationType: 'percentage_of_basic' },
      leaveTravelAllowance: { percentage: 8.33, computationType: 'percentage_of_basic' },
      fixedAllowance: { percentage: 0, computationType: 'remaining' },
    },
    
    // PF Configuration
    pfConfig: {
      employeeContributionRate: 12,
      employerContributionRate: 12,
    },
    
    // Tax Configuration
    taxConfig: {
      professionalTax: 200,
    },
  });

  // Calculated Values
  const [calculatedValues, setCalculatedValues] = useState({});

  // Calculate all salary components
  const calculateSalaryComponents = useCallback(() => {
    const { monthlyWage, components, pfConfig, taxConfig } = salaryConfig;
    
    // Calculate Basic Salary
    const basicSalary = (monthlyWage * components.basicSalary.percentage) / 100;
    
    // Calculate components based on basic salary
    const hra = (basicSalary * components.houseRentAllowance.percentage) / 100;
    const standardAllowance = (basicSalary * components.standardAllowance.percentage) / 100;
    const performanceBonus = (basicSalary * components.performanceBonus.percentage) / 100;
    const lta = (basicSalary * components.leaveTravelAllowance.percentage) / 100;
    
    // Fixed allowance = remaining after all components
    const totalComponents = basicSalary + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.max(0, monthlyWage - totalComponents);
    
    // PF Calculations (based on basic salary)
    const employeePF = (basicSalary * pfConfig.employeeContributionRate) / 100;
    const employerPF = (basicSalary * pfConfig.employerContributionRate) / 100;
    
    // Professional Tax
    const professionalTax = taxConfig.professionalTax;
    
    // Total Deductions
    const totalDeductions = employeePF + professionalTax;
    
    // Net Salary
    const grossSalary = monthlyWage;
    const netSalary = grossSalary - totalDeductions;

    setCalculatedValues({
      basicSalary,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance,
      employeePF,
      employerPF,
      professionalTax,
      totalDeductions,
      grossSalary,
      netSalary,
      totalComponents,
    });
  }, [salaryConfig]);

  useEffect(() => {
    calculateSalaryComponents();
  }, [calculateSalaryComponents]);

  // Update yearly wage when monthly changes
  useEffect(() => {
    setSalaryConfig(prev => ({
      ...prev,
      yearlyWage: prev.monthlyWage * 12,
    }));
  }, [salaryConfig.monthlyWage]);

  const handleWageChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setSalaryConfig(prev => ({
      ...prev,
      [field]: numValue,
      ...(field === 'monthlyWage' ? { yearlyWage: numValue * 12 } : {}),
      ...(field === 'yearlyWage' ? { monthlyWage: numValue / 12 } : {}),
    }));
  };

  const handleComponentChange = (component, field, value) => {
    setSalaryConfig(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          [field]: parseFloat(value) || 0,
        },
      },
    }));
  };

  const handlePFChange = (field, value) => {
    setSalaryConfig(prev => ({
      ...prev,
      pfConfig: {
        ...prev.pfConfig,
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleTaxChange = (field, value) => {
    setSalaryConfig(prev => ({
      ...prev,
      taxConfig: {
        ...prev.taxConfig,
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Check if total exceeds wage
  const isOverBudget = calculatedValues.totalComponents > salaryConfig.monthlyWage;

  if (!isAdmin) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Access Restricted</h3>
        <p className="text-neutral-500">Salary information is only visible to administrators.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Warning Banner */}
      {isOverBudget && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium text-error">
            Total salary components exceed the monthly wage. Please adjust the percentages.
          </span>
        </div>
      )}

      {/* Wage Configuration */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
          💰 Salary Information
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">Month Wage</label>
            <div className="relative">
              <input
                type="number"
                value={salaryConfig.monthlyWage}
                onChange={(e) => handleWageChange('monthlyWage', e.target.value)}
                className="w-full px-4 py-3 pr-16 bg-white/80 border border-neutral-200 rounded-xl text-neutral-800 font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">/ Month</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">Yearly Wage</label>
            <div className="relative">
              <input
                type="number"
                value={salaryConfig.yearlyWage}
                onChange={(e) => handleWageChange('yearlyWage', e.target.value)}
                className="w-full px-4 py-3 pr-16 bg-white/80 border border-neutral-200 rounded-xl text-neutral-800 font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">/ Yearly</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">Working Days / Week</label>
            <div className="relative">
              <input
                type="number"
                value={salaryConfig.workingDaysPerWeek}
                onChange={(e) => setSalaryConfig(prev => ({ ...prev, workingDaysPerWeek: parseInt(e.target.value) || 0 }))}
                min="1"
                max="7"
                className="w-full px-4 py-3 pr-12 bg-white/80 border border-neutral-200 rounded-xl text-neutral-800 font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">days</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">Break Time</label>
            <div className="relative">
              <input
                type="number"
                value={salaryConfig.breakTimeHours}
                onChange={(e) => setSalaryConfig(prev => ({ ...prev, breakTimeHours: parseFloat(e.target.value) || 0 }))}
                step="0.5"
                className="w-full px-4 py-3 pr-12 bg-white/80 border border-neutral-200 rounded-xl text-neutral-800 font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">hrs</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Salary Components */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Salary Components</h2>
        
        <div className="space-y-4">
          <SalaryComponentRow
            label="Basic Salary"
            description="Define Basic salary from company cost compute it based on monthly Wages"
            amount={calculatedValues.basicSalary}
            percentage={salaryConfig.components.basicSalary.percentage}
            onPercentageChange={(val) => handleComponentChange('basicSalary', 'percentage', val)}
            baseLabel="of Wage"
            formatCurrency={formatCurrency}
          />
          
          <SalaryComponentRow
            label="House Rent Allowance"
            description="HRA provided to employees 50% of the basic salary"
            amount={calculatedValues.hra}
            percentage={salaryConfig.components.houseRentAllowance.percentage}
            onPercentageChange={(val) => handleComponentChange('houseRentAllowance', 'percentage', val)}
            baseLabel="of Basic"
            formatCurrency={formatCurrency}
          />
          
          <SalaryComponentRow
            label="Standard Allowance"
            description="A standard allowance is a predetermined, fixed amount provided to employee as part of their salary"
            amount={calculatedValues.standardAllowance}
            percentage={salaryConfig.components.standardAllowance.percentage}
            onPercentageChange={(val) => handleComponentChange('standardAllowance', 'percentage', val)}
            baseLabel="of Basic"
            formatCurrency={formatCurrency}
          />
          
          <SalaryComponentRow
            label="Performance Bonus"
            description="Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary"
            amount={calculatedValues.performanceBonus}
            percentage={salaryConfig.components.performanceBonus.percentage}
            onPercentageChange={(val) => handleComponentChange('performanceBonus', 'percentage', val)}
            baseLabel="of Basic"
            formatCurrency={formatCurrency}
          />
          
          <SalaryComponentRow
            label="Leave Travel Allowance"
            description="LTA is paid by the company to employees to cover their travel expenses, and calculated as a % of the basic salary"
            amount={calculatedValues.lta}
            percentage={salaryConfig.components.leaveTravelAllowance.percentage}
            onPercentageChange={(val) => handleComponentChange('leaveTravelAllowance', 'percentage', val)}
            baseLabel="of Basic"
            formatCurrency={formatCurrency}
          />
          
          <SalaryComponentRow
            label="Fixed Allowance"
            description="Fixed allowance portion of wages is determined after calculating all salary components"
            amount={calculatedValues.fixedAllowance}
            percentage={((calculatedValues.fixedAllowance / salaryConfig.monthlyWage) * 100).toFixed(2)}
            isReadOnly
            baseLabel="of Wage"
            formatCurrency={formatCurrency}
          />
        </div>
      </Card>

      {/* PF & Tax Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Provident Fund */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Provident Fund (PF) Contribution</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-800">Employee</p>
                <p className="text-xs text-neutral-500">PF is calculated based on the basic salary</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-900">{formatCurrency(calculatedValues.employeePF || 0)}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={salaryConfig.pfConfig.employeeContributionRate}
                    onChange={(e) => handlePFChange('employeeContributionRate', e.target.value)}
                    className="w-16 px-2 py-1 text-center bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  />
                  <span className="text-sm text-neutral-500">%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-800">Employer</p>
                <p className="text-xs text-neutral-500">PF is calculated based on the basic salary</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-900">{formatCurrency(calculatedValues.employerPF || 0)}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={salaryConfig.pfConfig.employerContributionRate}
                    onChange={(e) => handlePFChange('employerContributionRate', e.target.value)}
                    className="w-16 px-2 py-1 text-center bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  />
                  <span className="text-sm text-neutral-500">%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tax Deductions */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Tax Deductions</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-800">Professional Tax</p>
                <p className="text-xs text-neutral-500">Professional Tax deducted from the Gross salary</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={salaryConfig.taxConfig.professionalTax}
                  onChange={(e) => handleTaxChange('professionalTax', e.target.value)}
                  className="w-24 px-3 py-2 text-right bg-white border border-neutral-200 rounded-lg font-semibold focus:outline-none focus:border-primary-400"
                />
                <span className="text-sm text-neutral-500">₹ / month</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-600">Gross Salary</span>
              <span className="font-semibold text-neutral-900">{formatCurrency(calculatedValues.grossSalary || 0)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-600">Total Deductions</span>
              <span className="font-semibold text-error">- {formatCurrency(calculatedValues.totalDeductions || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Net Salary</span>
              <span className="text-xl font-bold text-success">{formatCurrency(calculatedValues.netSalary || 0)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {saveError}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          variant="primary" 
          onClick={async () => {
            if (!employeeId) {
              onUpdate?.({ ...salaryConfig, calculatedValues });
              return;
            }
            
            setSaving(true);
            setSaveError(null);
            
            try {
              const salaryData = {
                salary: {
                  monthlyWage: salaryConfig.monthlyWage,
                  yearlyWage: salaryConfig.yearlyWage,
                  components: {
                    basicSalary: { 
                      percentage: salaryConfig.components.basicSalary.percentage,
                      amount: calculatedValues.basicSalary 
                    },
                    houseRentAllowance: { 
                      percentage: salaryConfig.components.houseRentAllowance.percentage,
                      amount: calculatedValues.hra 
                    },
                    standardAllowance: { 
                      percentage: salaryConfig.components.standardAllowance.percentage,
                      amount: calculatedValues.standardAllowance 
                    },
                    performanceBonus: { 
                      percentage: salaryConfig.components.performanceBonus.percentage,
                      amount: calculatedValues.performanceBonus 
                    },
                    leaveTravelAllowance: { 
                      percentage: salaryConfig.components.leaveTravelAllowance.percentage,
                      amount: calculatedValues.lta 
                    },
                    fixedAllowance: { 
                      percentage: parseFloat(((calculatedValues.fixedAllowance / salaryConfig.monthlyWage) * 100).toFixed(2)),
                      amount: calculatedValues.fixedAllowance 
                    },
                  },
                  deductions: {
                    providentFund: {
                      employee: { 
                        percentage: salaryConfig.pfConfig.employeeContributionRate,
                        amount: calculatedValues.employeePF 
                      },
                      employer: { 
                        percentage: salaryConfig.pfConfig.employerContributionRate,
                        amount: calculatedValues.employerPF 
                      },
                    },
                    professionalTax: { 
                      amount: salaryConfig.taxConfig.professionalTax 
                    },
                  },
                  grossSalary: calculatedValues.grossSalary,
                  totalDeductions: calculatedValues.totalDeductions,
                  netSalary: calculatedValues.netSalary,
                },
                workingSchedule: {
                  workingDaysPerWeek: salaryConfig.workingDaysPerWeek,
                  breakTimeHours: salaryConfig.breakTimeHours,
                },
              };
              
              const response = await employeeAPI.updateSalary(employeeId, salaryData);
              
              if (response.success) {
                alert('Salary saved successfully!');
                onSaveSuccess?.();
              } else {
                setSaveError(response.message || 'Failed to save salary');
              }
            } catch (error) {
              console.error('Save salary error:', error);
              setSaveError(error.message || 'Failed to save salary');
            } finally {
              setSaving(false);
            }
          }}
          className="px-8"
          disabled={saving || isOverBudget}
        >
          {saving ? 'Saving...' : 'Save Salary Configuration'}
        </Button>
      </div>
    </div>
  );
};

// Salary Component Row
const SalaryComponentRow = ({ 
  label, 
  description, 
  amount, 
  percentage, 
  onPercentageChange, 
  baseLabel,
  isReadOnly = false,
  formatCurrency 
}) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-neutral-50 rounded-xl gap-4">
    <div className="flex-1">
      <p className="font-medium text-neutral-800">{label}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="font-semibold text-neutral-900 min-w-[100px] text-right">
        {formatCurrency(amount || 0)}
      </span>
      <span className="text-neutral-400">₹ / month</span>
      <div className="flex items-center gap-1 min-w-[100px]">
        {isReadOnly ? (
          <span className="font-medium text-neutral-600">{percentage}%</span>
        ) : (
          <input
            type="number"
            value={percentage}
            onChange={(e) => onPercentageChange(e.target.value)}
            step="0.01"
            className="w-16 px-2 py-1 text-center bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
          />
        )}
        <span className="text-xs text-neutral-500">% {baseLabel}</span>
      </div>
    </div>
  </div>
);

export default SalaryInfoTab;

