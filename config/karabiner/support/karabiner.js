// I use this to generate my Karabiner Elements configuration
// This has been modified and adapted from https://github.com/wincent/wincent/blob/master/aspects/karabiner/support/karabiner.js

/* Functions */

function fromTo(from, to) {
  return {
    from: {
      key_code: from,
    },
    to: {
      key_code: to,
    },
  };
}

function hyperSpaceFromTo(from, to, { withHyperModifiers = false } = {}) {
  const hyperModifiers = withHyperModifiers
    ? {
        modifiers: [
          "left_shift",
          "left_command",
          "left_control",
          "left_option",
        ],
      }
    : {};
  return [
    {
      from: {
        modifiers: {
          optional: ["any"],
        },
        simultaneous: [
          {
            key_code: "spacebar",
          },
          {
            key_code: from,
          },
        ],
        simultaneous_options: {
          key_down_order: "strict",
          key_up_order: "strict_inverse",
          to_after_key_up: [
            {
              set_variable: {
                name: "HyperSpace",
                value: 0,
              },
            },
          ],
        },
      },
      parameters: {
        "basic.simultaneous_threshold_milliseconds": 500 /* Default: 1000 */,
      },
      to: [
        {
          set_variable: {
            name: "HyperSpace",
            value: 1,
          },
        },
        {
          key_code: to,
          ...hyperModifiers,
        },
      ],
      type: "basic",
    },
    {
      conditions: [
        {
          name: "HyperSpace",
          type: "variable_if",
          value: 1,
        },
      ],
      from: {
        key_code: from,
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          key_code: to,
          ...hyperModifiers,
        },
      ],
      type: "basic",
    },
  ];
}

function hyperSpaceShortcut(shortcutKey) {
  return hyperSpaceFromTo(shortcutKey, shortcutKey, {
    withHyperModifiers: true,
  });
}

function fromToIfAlone(from, to, to_if_alone, to_if_held_down = undefined) {
  return {
    from: {
      key_code: from,
      modifiers: {
        optional: ["any"],
      },
    },
    to: [
      {
        key_code: to,
        lazy: true,
      },
    ],
    to_if_held_down: [
      {
        key_code: to_if_held_down ? to_if_held_down : to,
      },
    ],
    to_if_alone: [
      {
        key_code: to_if_alone,
      },
    ],
    type: "basic",
  };
}

/** Complex Rules **/

const CAPS_CONTROL_ESC_RULE = {
  description:
    "Change Caps Lock to Control when used as modifier, Esc when used alone",
  manipulators: [fromToIfAlone("caps_lock", "left_control", "escape")],
};

const CAPS_LOCK_TOGGLE_RULE = {
  description: "Left and Right Shift together toggle Caps Lock",
  manipulators: [
    {
      from: {
        modifiers: {
          optional: ["any"],
        },
        simultaneous: [
          {
            key_code: "left_shift",
          },
          {
            key_code: "right_shift",
          },
        ],
      },
      to: [
        {
          key_code: "caps_lock",
        },
      ],
      type: "basic",
    },
  ],
};

const TAB_SHIFT_RULE = {
  description:
    "Change Tab to Shift when used as modifier, keep Tab when used alone",
  manipulators: [fromToIfAlone("tab", "left_shift", "tab")],
};

/* Devices */

const APPLE_INTERNAL_NL = {
  disable_built_in_keyboard_if_exists: false,
  fn_function_keys: [],
  ignore: false,
  manipulate_caps_lock_led: true,
  simple_modifications: [
    fromTo("grave_accent_and_tilde", "left_shift"),
    fromTo("non_us_backslash", "grave_accent_and_tilde"),
  ],
  identifiers: {
    is_keyboard: true,
    is_pointing_device: false,
    product_id: 632,
    vendor_id: 1452,
  },
};

/* Default values */

const PARAMETERS_DEFAULT = {
  "basic.simultaneous_threshold_milliseconds": 50,
  "basic.to_delayed_action_delay_milliseconds": 500,
  "basic.to_if_held_down_threshold_milliseconds": 500,
  "basic.to_if_alone_timeout_milliseconds": 500,
};

const COMPLEX_RULES_DEFAULT = [CAPS_LOCK_TOGGLE_RULE];

/* Profiles */

const VANILLA_PROFILE = {
  name: "Vanilla",
  selected: false,
  simple_modifications: [],
};

const DEFAULT_PROFILE = {
  ...VANILLA_PROFILE,
  complex_modifications: {
    parameters: {
      ...PARAMETERS_DEFAULT,
    },
    rules: [
      ...COMPLEX_RULES_DEFAULT,
      CAPS_CONTROL_ESC_RULE,
      {
        description: "HyperSpace Layer",
        manipulators: [
          ...hyperSpaceFromTo("l", "right_arrow"),
          ...hyperSpaceFromTo("j", "down_arrow"),
          ...hyperSpaceFromTo("h", "left_arrow"),
          ...hyperSpaceFromTo("k", "up_arrow"),
          ...hyperSpaceShortcut("d"), // Hyper + D to toggle mute/unmute on Discord
        ],
      },
    ],
  },
  devices: [APPLE_INTERNAL_NL],
  name: "Hyper",
  selected: true,
};

const GAMING_PROFILE = {
  ...VANILLA_PROFILE,
  simple_modifications: [fromTo("caps_lock", "left_control")],
  complex_modifications: {
    parameters: {
      ...PARAMETERS_DEFAULT,
    },
    rules: [...COMPLEX_RULES_DEFAULT, TAB_SHIFT_RULE],
  },
  devices: [APPLE_INTERNAL_NL],
  name: "Gaming",
};

/* Config */

const CONFIG = {
  global: {
    check_for_updates_on_startup: true,
    show_in_menu_bar: true,
    show_profile_name_in_menu_bar: true,
  },
  profiles: [VANILLA_PROFILE, DEFAULT_PROFILE, GAMING_PROFILE],
};

if (process.argv.includes("--out")) {
  process.stdout.write(JSON.stringify(CONFIG, null, 2) + "\n");
}
