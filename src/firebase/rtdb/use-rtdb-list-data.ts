'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Database,
  ref,
  onValue,
  off,
  query,
  limitToFirst,
  limitToLast,
  orderByChild,
  Query,
} from 'firebase/database';

interface RtdbQueryOptions {
  limitToFirst?: number;
  limitToLast?: number;
  orderBy?: string;
}

export function useRtdbListData<T>(
  db: Database | null,
  path: string,
  options: RtdbQueryOptions = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedPath = useMemo(() => path, [path]);
  const memoizedOptions = useMemo(() => JSON.stringify(options), [Object.values(options).join(',')]);

  useEffect(() => {
    if (!db || !memoizedPath) {
      setIsLoading(false);
      return;
    }

    let dbQuery: Query = ref(db, memoizedPath);
    const parsedOptions = JSON.parse(memoizedOptions);

    if (parsedOptions.orderBy) {
      dbQuery = query(dbQuery, orderByChild(parsedOptions.orderBy));
    }
    if (parsedOptions.limitToFirst) {
      dbQuery = query(dbQuery, limitToFirst(parsedOptions.limitToFirst));
    }
    if (parsedOptions.limitToLast) {
      dbQuery = query(dbQuery, limitToLast(parsedOptions.limitToLast));
    }

    const listener = onValue(
      dbQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          let listData = Object.keys(val).map(key => ({
            ...val[key],
            id: key,
          }));

          // When using limitToLast, RTDB returns items in ascending order.
          // We need to reverse the array to get the latest item first.
          if (parsedOptions.limitToLast) {
            listData = listData.reverse();
          }
          
          setData(listData);
        } else {
          setData([]);
        }
        setIsLoading(false);
      },
      (err: Error) => {
        console.error(err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      off(dbQuery, 'value', listener);
    };
  }, [db, memoizedPath, memoizedOptions]);

  return { data, isLoading, error };
}
