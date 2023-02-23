import React from 'react';
import styles from './index.less';
import { Link } from 'umi';

export default function Index() {
  return (
    <div className={styles.homePage}>
      <Link to="/heart">heart</Link>
    </div>
  );
}
