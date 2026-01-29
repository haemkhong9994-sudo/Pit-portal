
export enum DependentStatus {
  PROCESSING = 'Đang xử lý',
  SUCCESS_INCREASE = 'Báo tăng thành công',
  SUCCESS_DECREASE = 'Báo giảm thành công',
  NOT_APPLICABLE = 'Báo tăng nhưng không áp dụng tại công ty'
}

export type Relationship = 'Cha/mẹ' | 'Con' | 'Vợ/chồng' | 'Đối tượng khác';

export type TaxSyncStatus = 'synced' | 'unsynced' | 'unknown';

export interface Address {
  province: string;
  ward: string;
  detail: string;
}

export interface Dependent {
  id: string;
  fullName: string;
  taxId: string;
  dob: string;
  cccd: string;
  relationship: Relationship;
  permanentAddress: Address;
  currentAddress: Address;
  status: DependentStatus;
  startDate: string;
  endDate: string;
  salaryDeductionDate: string;
  paperDocDate: string;
  isConfirmed: boolean;
  isInfoChecked: boolean;
  isSent: boolean;
  isTerminated: boolean;
  processingResult?: string;
  confirmationStatus?: string;
  note?: string;
}

export type UserRole = 'Admin' | 'Nhân Viên';

export interface UserProfile {
  fullName: string;
  email: string;
  cccd: string;
  taxId: string;
  isVerified: boolean;
  isDependentsVerified: boolean;
  note: string;
  taxSyncStatus: TaxSyncStatus;
  role?: UserRole; // F Column in User Sheet
  avatarUrl?: string; // E Column in User Sheet
  dependentCount?: number; // I Column in User Sheet
}

export type ActiveTab = 'home' | 'tax' | 'dependents' | 'overall';
