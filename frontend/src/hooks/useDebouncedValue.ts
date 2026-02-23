import { useState, useEffect } from 'react'

/**
 * 返回在延迟 delay 毫秒后更新的值，用于输入框防抖，避免连续打字时频繁触发查询/跳转。
 * @param value 原始值（如输入框的 value）
 * @param delay 防抖延迟（毫秒）
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
