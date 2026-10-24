import type { InjectionKey } from 'vue';

export { default as InputOTP, type InputOTPProps } from './InputOTP.vue';
export {
  default as InputOTPGroup,
  type InputOTPGroupProps,
} from './InputOTPGroup.vue';
export {
  default as InputOTPSeparator,
  type InputOTPSeparatorProps,
} from './InputOTPSeparator.vue';
export {
  default as InputOTPSlot,
  type InputOTPSlotProps,
} from './InputOTPSlot.vue';

export const InputOTPKey: InjectionKey<Record<string, unknown>> =
  Symbol('input-otp');
