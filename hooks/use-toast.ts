'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

// 最大表示可能なトーストの数
const TOAST_LIMIT = 1;

// トーストが自動削除されるまでの遅延時間（ミリ秒）
const TOAST_REMOVE_DELAY = 1000000;

/**
 * トーストの情報を保持する型
 * ToastPropsに独自のプロパティ(id, title, description, action)を追加
 */
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// トーストに対する各アクションの種類
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

// トースト用の一意なIDを生成するためのカウンタ
let count = 0;
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

/**
 * 各アクションの型定義
 */
type Action =
  | {
      type: typeof actionTypes.ADD_TOAST;
      toast: ToasterToast;
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST;
      toast: Partial<ToasterToast>;
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST;
      toastId?: ToasterToast['id'];
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST;
      toastId?: ToasterToast['id'];
    };

/**
 * ストアの状態を管理する型
 */
interface State {
  toasts: ToasterToast[];
}

/**
 * トーストの自動削除タイマーを管理するマップ
 * toastIdをキーに、setTimeoutの戻り値を保持する
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * 指定したトーストIDのトーストを自動削除キューに追加する
 * すでにタイマーが設定されている場合は何もしない
 *
 * @param toastId - 自動削除対象のトーストID
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer関数
 * 現在の状態とアクションに応じて新しい状態を返す
 *
 * @param state - 現在の状態
 * @param action - 実行するアクション
 * @returns 新しい状態
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        // 新しいトーストを先頭に追加し、上限を超えた場合は後ろを削除
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        // 該当するトーストを更新
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // 指定されたトーストまたはすべてのトーストを非表示にし、削除キューに追加
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          // toastIdが指定されている場合、そのトーストを非表示にする
          // もしくは全トーストの場合、すべてを非表示にする
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      // toastIdが指定されなければすべてのトーストを削除
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      // 指定されたトーストを削除
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

/**
 * 状態更新をリッスンする関数群
 * 各リスナーは状態更新時に呼び出される
 */
const listeners: Array<(state: State) => void> = [];

/**
 * メモリ上の状態を保持する変数
 */
let memoryState: State = { toasts: [] };

/**
 * 状態を更新し、全リスナーに通知するdispatch関数
 *
 * @param action - 実行するアクション
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

/**
 * トースト生成用のプロパティ（id以外）
 */
type Toast = Omit<ToasterToast, 'id'>;

/**
 * トーストを表示する関数
 * トーストの追加、更新、非表示処理を行う
 *
 * @param props - トーストのプロパティ
 * @returns トーストIDと操作用関数(update, dismiss)
 */
function toast({ ...props }: Toast) {
  const id = genId();

  // トーストの更新関数
  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  // トーストの非表示関数
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  // トーストを追加。open:trueで表示し、onOpenChangeで閉じるとdismissを呼ぶ
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

/**
 * useToastフック
 * トーストの状態と操作関数をコンポーネントで利用できるようにする
 *
 * @returns 現在のトースト状態と操作関数（toast, dismiss）
 */
function useToast() {
  // memoryStateを初期値としてReactの状態を管理
  const [state, setState] = React.useState<State>(memoryState);

  // コンポーネントのマウント時にリスナーを登録し、アンマウント時に解除する
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []); // 初回マウント時のみ実行

  return {
    ...state,
    toast,
    // 任意のトーストを非表示にするための関数
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
