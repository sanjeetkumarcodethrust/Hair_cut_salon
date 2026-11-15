import { Check, Circle } from 'lucide-react';
import { validatePassword } from '../utils/passwordValidator.js';

export const PasswordRequirements = ({ password = '', showStrength = true }) => {
  const { checks, isValid } = validatePassword(password);
  
  const rules = [
    { key: 'minLength', label: 'Minimum 8 characters', met: checks.minLength },
    { key: 'hasUpper', label: 'One capital letter (A-Z)', met: checks.hasUpper },
    { key: 'hasLower', label: 'One small letter (a-z)', met: checks.hasLower },
    { key: 'hasSymbol', label: 'One symbol (e.g. !@#$%)', met: checks.hasSymbol },
  ];

  const metCount = rules.filter((r) => r.met).length;

  const strengthConfig = [
    { label: '', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' },
    { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const currentStrength = strengthConfig[metCount];

  return (
    <div className="space-y-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs transition-all dark:border-slate-800/80 dark:bg-slate-950/40">
      {showStrength && (
        <div className="space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span className="text-slate-500 dark:text-slate-400">Password requirements</span>
            {password.length > 0 && (
              <span className={`font-semibold ${currentStrength.text}`}>
                {currentStrength.label} ({metCount}/4)
              </span>
            )}
          </div>
          <div className="grid h-1.5 w-full grid-cols-4 gap-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  metCount >= step ? currentStrength.color : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              rule.met
                ? 'font-medium text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {rule.met ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            ) : (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Circle className="h-2 w-2 fill-current" />
              </span>
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
