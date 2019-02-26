import React from 'react';
import { Link } from 'gatsby';
import useBreadcrumb from './useBreadcrumb';

const Breadcrumb = ({
  title = '',
  location,
  crumbLabel,
  crumbSeparator,
  crumbWrapperStyle,
  crumbActiveStyle,
  crumbStyle,
  ...rest
}) => {
  const { crumbs } = useBreadcrumb({
    location,
    crumbLabel,
    crumbSeparator,
    crumbStyle,
    crumbActiveStyle,
  });

  return (
    <div>
      <span>{title}</span>
      {crumbs.map((c, i) => {
        return (
          <div style={{ display: 'inline' }} key={i} {...crumbWrapperStyle}>
            <Link
              to={c.pathname}
              style={{
                textDecoration: 'none',
                fontSize: '16pt',
                color: '#e1e1e1',
                ...c.crumbStyle,
              }}
              activeStyle={{
                color: 'white',
                ...crumbActiveStyle,
              }}
              state={{
                crumbClicked: true,
              }}
            >
              {c.crumbLabel}
            </Link>
            {c.crumbSeparator || ' / '}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
