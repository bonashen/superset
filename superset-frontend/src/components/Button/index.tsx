/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  Children,
  ReactElement,
  ReactNode,
  Fragment,
  MouseEventHandler,
} from 'react';

import { mix } from 'polished';
import cx from 'classnames';
import { Button as AntdButton } from 'antd-v5';
import { useTheme } from '@superset-ui/core';
import { Tooltip, TooltipProps } from 'src/components/Tooltip';
import { ButtonProps as AntdButtonProps } from 'antd-v5/lib/button';

export type OnClickHandler = MouseEventHandler<HTMLElement>;

export type ButtonStyle =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'default'
  | 'link'
  | 'dashed';

export type ButtonSize = 'default' | 'small' | 'xsmall';

export type ButtonProps = Omit<AntdButtonProps, 'css'> &
  Pick<TooltipProps, 'placement'> & {
    tooltip?: ReactNode;
    className?: string;
    buttonSize?: ButtonSize;
    buttonStyle?: ButtonStyle;
    cta?: boolean;
    showMarginRight?: boolean;
  };

const decideType = (buttonStyle: ButtonStyle) => {
  const typeMap: Record<
    ButtonStyle,
    'primary' | 'default' | 'dashed' | 'link'
  > = {
    primary: 'primary',
    danger: 'primary',
    warning: 'primary',
    success: 'primary',
    secondary: 'default',
    default: 'default',
    tertiary: 'default',
    dashed: 'dashed',
    link: 'link',
  };

  return typeMap[buttonStyle];
};

export default function Button(props: ButtonProps) {
  const {
    tooltip,
    placement,
    disabled = false,
    buttonSize,
    buttonStyle,
    className,
    cta,
    children,
    href,
    showMarginRight = true,
    ...restProps
  } = props;

  const theme = useTheme();
  const { colors, transitionTiming, borderRadius, typography } = theme;
  const { primary, grayscale, success, warning } = colors;

  let height = 32;
  let padding = 18;
  if (buttonSize === 'xsmall') {
    height = 22;
    padding = 5;
  } else if (buttonSize === 'small') {
    height = 30;
    padding = 10;
  }

  let backgroundColor;
  let backgroundColorHover;
  let backgroundColorActive;
  let backgroundColorDisabled = grayscale.light2;
  let color;
  let colorHover;
  let borderWidth = 0;
  let borderStyle = 'none';
  let borderColor;
  let borderColorHover;
  let borderColorDisabled = 'transparent';

  if (buttonStyle === 'tertiary' || buttonStyle === 'dashed') {
    backgroundColor = grayscale.light5;
    backgroundColorHover = grayscale.light5;
    backgroundColorActive = grayscale.light5;
    backgroundColorDisabled = grayscale.light5;
    borderWidth = 1;
    borderStyle = buttonStyle === 'dashed' ? 'dashed' : 'solid';
    borderColor = primary.dark1;
    borderColorHover = primary.light1;
    borderColorDisabled = grayscale.light2;
  } else if (buttonStyle === 'danger') {
    colorHover = color;
  } else if (buttonStyle === 'warning') {
    backgroundColor = warning.base;
    backgroundColorHover = mix(0.1, grayscale.dark2, warning.base);
    backgroundColorActive = mix(0.2, grayscale.dark2, warning.base);
    color = grayscale.light5;
    colorHover = color;
  } else if (buttonStyle === 'success') {
    backgroundColor = success.base;
    backgroundColorHover = mix(0.1, grayscale.light5, success.base);
    backgroundColorActive = mix(0.2, grayscale.dark2, success.base);
    color = grayscale.light5;
    colorHover = color;
  } else if (buttonStyle === 'link') {
    backgroundColor = 'transparent';
    backgroundColorHover = 'transparent';
    backgroundColorActive = 'transparent';
    color = primary.dark1;
  }

  const element = children as ReactElement;

  let renderedChildren = [];
  if (element && element.type === Fragment) {
    renderedChildren = Children.toArray(element.props.children);
  } else {
    renderedChildren = Children.toArray(children);
  }
  const firstChildMargin =
    showMarginRight && renderedChildren.length > 1 ? theme.gridUnit * 2 : 0;

  const effectiveButtonStyle: ButtonStyle = buttonStyle ?? 'default';

  const button = (
    <AntdButton
      href={disabled ? undefined : href}
      disabled={disabled}
      type={decideType(effectiveButtonStyle)}
      danger={effectiveButtonStyle === 'danger'}
      className={cx(
        className,
        'superset-button',
        // A static class name containing the button style is available to
        // support customizing button styles in embedded dashboards.
        `superset-button-${buttonStyle}`,
        { cta: !!cta },
      )}
      css={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1.5715,
        fontSize: typography.sizes.s,
        fontWeight: typography.weights.bold,
        height,
        padding: `0px ${padding}px`,
        transition: `all ${transitionTiming}s`,
        minWidth: cta ? theme.gridUnit * 36 : undefined,
        minHeight: cta ? theme.gridUnit * 8 : undefined,
        boxShadow: 'none',
        borderWidth,
        borderStyle,
        borderColor,
        borderRadius,
        color,
        background: backgroundColor,
        ...(colorHover || backgroundColorHover || borderColorHover
          ? {
              [`&.superset-button.superset-button-${buttonStyle}:hover`]: {
                ...(colorHover && { color: colorHover }),
                ...(backgroundColorHover && {
                  background: backgroundColorHover,
                }),
                ...(borderColorHover && { borderColor: borderColorHover }),
              },
            }
          : {}),
        '&:active': {
          color,
          backgroundColor: backgroundColorActive,
        },
        '&:focus': {
          color,
          backgroundColor,
          borderColor,
        },
        '&[disabled], &[disabled]:hover': {
          color: grayscale.base,
          backgroundColor:
            buttonStyle === 'link' ? 'transparent' : backgroundColorDisabled,
          borderColor:
            buttonStyle === 'link' ? 'transparent' : borderColorDisabled,
          pointerEvents: 'none',
        },
        marginLeft: 0,
        '& + .superset-button': {
          marginLeft: theme.gridUnit * 2,
        },
        '& > span > :first-of-type': {
          marginRight: firstChildMargin,
        },
      }}
      {...restProps}
    >
      {children}
    </AntdButton>
  );

  if (tooltip) {
    return (
      <Tooltip placement={placement} title={tooltip}>
        {/* wrap the button in a span so that the tooltip shows up
        when the button is disabled. */}
        {disabled ? (
          <span
            css={{
              cursor: 'not-allowed',
              '& > .superset-button': {
                marginLeft: theme.gridUnit * 2,
              },
            }}
          >
            {button}
          </span>
        ) : (
          button
        )}
      </Tooltip>
    );
  }

  return button;
}
