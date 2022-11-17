addComponent({
  name: "Slider",
  type: "Slider",
  icon: '<i class="fas fa-sliders-h"></i>',
  property: {
    name: {
      label: "Name",
      type: "text",
      pattern: /^\w+$/,
      default: function () {
        return objectNameGen("slider");
      },
    },
    parent: {
      label: "Parent",
      type: "parent",
    },
    hidden: {
      label: "Hidden",
      type: "choice",
      choice: [
        {
          label: "Show",
          value: 1,
        },
        {
          label: "Hides",
          value: 0,
        },
      ],
      default: 1,
    },
    define: {
      label: "Definition",
      type: "choice",
      choice: [
        {
          label: "Local",
          value: 0,
        },
        {
          label: "Global",
          value: 1,
        },
      ],
      default: 0,
    },
    alignX: {
      label: "Align X",
      type: "choice",
      choice: [
        {
          label: "Left",
          value: 0,
        },
        {
          label: "Center",
          value: 1,
        },
        {
          label: "Right",
          value: 2,
        },
      ],
      default: 0,
    },
    alignY: {
      label: "Align Y",
      type: "choice",
      choice: [
        {
          label: "Top",
          value: 0,
        },
        {
          label: "Mid",
          value: 1,
        },
        {
          label: "Bottom",
          value: 2,
        },
      ],
      default: 0,
    },
    x: {
      label: "X offset",
      type: "number",
      default: 0,
      inputOffset: "x",
    },
    y: {
      label: "Y offset",
      type: "number",
      default: 0,
      inputOffset: "y",
    },
    width: {
      label: "Width",
      type: "number",
      default: 250,
    },
    height: {
      label: "Height",
      type: "number",
      default: 20,
    },
    background_main_color: {
      label: "Background Main color",
      type: "color",
      default: "#EEEEEE",
    },
    background_grad_color: {
      label: "Background Gradient color",
      type: "color",
      default: "#FFFFFF",
    },
    background_grad_dir: {
      label: "Gradient direction",
      type: "choice",
      choice: [
        {
          label: "None",
          value: 0,
        },
        {
          label: "Horizontal",
          value: 1,
        },
        {
          label: "Vertical",
          value: 2,
        },
      ],
      default: 0,
    },
    background_border_width: {
      label: "Background Border Width",
      type: "number",
      default: 0,
    },
    background_border_color: {
      label: "Background Border Color",
      type: "color",
      default: "#FFFFFF",
    },
    background_radius: {
      label: "Background Radius",
      type: "number",
      default: 20,
    },
    /*
    background_padding: {
      label: "Background Padding",
      type: "number",
      default: 6
    },
    */
    indicator_main_color: {
      label: "Indicator Main color",
      type: "color",
      default: "#FF0000",
    },
    indicator_grad_color: {
      label: "Indicator Gradient color",
      type: "color",
      default: "#FFFFFF",
    },
    indicator_grad_dir: {
      label: "Gradient direction",
      type: "choice",
      choice: [
        {
          label: "None",
          value: 0,
        },
        {
          label: "Horizontal",
          value: 1,
        },
        {
          label: "Vertical",
          value: 2,
        },
      ],
      default: 0,
    },
    indicator_border_width: {
      label: "Indicator Border Width",
      type: "number",
      default: 0,
    },
    indicator_border_color: {
      label: "Indicator Border Color",
      type: "color",
      default: "#FFFFFF",
    },
    /*
    indicator_radius: {
      label: "Indicator Radius",
      type: "number",
      default: 20
    },
    indicator_padding: {
      label: "Indicator Padding",
      type: "number",
      default: 6
    },
    */
    knob_main_color: {
      label: "Knob Main color",
      type: "color",
      default: "#FF0000",
    },
    knob_grad_color: {
      label: "Knob Gradient color",
      type: "color",
      default: "#FFFFFF",
    },
    knob_grad_dir: {
      label: "Gradient direction",
      type: "choice",
      choice: [
        {
          label: "None",
          value: 0,
        },
        {
          label: "Horizontal",
          value: 1,
        },
        {
          label: "Vertical",
          value: 2,
        },
      ],
      default: 0,
    },
    knob_border_width: {
      label: "Knob Border Width",
      type: "number",
      default: 0,
    },
    knob_border_color: {
      label: "Knob Border Color",
      type: "color",
      default: "#FFFFFF",
    },
    value: {
      label: "Value",
      type: "number",
      default: 0,
    },
    range_min: {
      label: "Range min",
      type: "number",
      default: 0,
    },
    range_max: {
      label: "Range max",
      type: "number",
      default: 100,
    },
    handler: {
      label: "Handler",
      type: "text",
      default: "",
    },
  },
  render: {
    create: function (id) {
      let group = document.createElement("div");

      let bg = document.createElement("div");
      bg.className = "bg";
      $(bg).css({
        position: "absolute",
        width: "100%",
        height: "100%",
      });
      group.appendChild(bg);

      let indic = document.createElement("div");
      indic.className = "indic";
      $(indic).css({
        height: "100%",
        "border-radius": "100%",
      });
      bg.appendChild(indic);

      let knob = document.createElement("div");
      knob.className = "knob";
      $(knob).css({
        position: "absolute",
        top: -3 + -4,
        left: 0,
        "border-radius": "100%",
      });
      group.appendChild(knob);
      return group;
    },
    /* move: function(x, y, width, height) {
      this.property.x = x + 1; // Fix offset bug
      this.property.y = y + 6; // Fix offset bug
      if (this.property.align === 1) { // Center
        this.property.x = this.property.x + (width / 2);
      } else if (this.property.align === 2) { // Right
        this.property.x = this.property.x + width;
      }
      this.property.x = Math.round(this.property.x);
      this.property.y = Math.round(this.property.y);
    }, */
    frame: function () {
      return [];
    },
    update: function (element) {
      $(element).css({
        width: this.property.width == 0 ? "auto" : this.property.width,
        height: this.property.height == 0 ? "auto" : this.property.height,
        /*         "padding-top": `${this.property.padding}px`,
        "padding-bottom": `${this.property.padding}px`, */
        position: "absolute",
      });

      $(element)
        .find(".bg")
        .css({
          "border-radius": `${this.property.background_radius}px`,
          background:
            +this.property.background_grad_dir === 0
              ? this.property.background_main_color
              : `linear-gradient(${
                  +this.property.background_grad_dir === 1 ? "90" : "180"
                }deg, ${this.property.background_main_color} 0%, ${
                  this.property.background_grad_color
                } 100%)`,
          border: `${this.property.background_border_width}px solid ${this.property.background_border_color}`,
          width: `${this.property.width}px`,
          height: `${this.property.height}px`,
          padding: `${this.property.indicator_padding}px`,
        });

      $(element)
        .find(".indic")
        .css({
          "border-radius": `${this.property.height / 2}px`,
          background:
            +this.property.indicator_grad_dir === 0
              ? this.property.indicator_main_color
              : `linear-gradient(${
                  +this.property.indicator_grad_dir === 1 ? "90" : "180"
                }deg, ${this.property.indicator_main_color} 0%, ${
                  this.property.indicator_grad_color
                } 100%)`,
          "box-shadow": `0 0 0 ${this.property.indicator_border_width}px ${this.property.indicator_border_color}`,
          width: `${
            (this.property.value /
              (this.property.range_max - this.property.range_min)) *
            100
          }%`,
        });

      $(element)
        .find(".knob")
        .css({
          width: this.property.height + 6 + 8,
          height: this.property.height + 6 + 8,
          background:
            +this.property.knob_grad_dir === 0
              ? this.property.knob_main_color
              : `linear-gradient(${
                  +this.property.knob_grad_dir === 1 ? "90" : "180"
                }deg, ${this.property.knob_main_color} 0%, ${
                  this.property.knob_grad_color
                } 100%)`,
          border: `${this.property.knob_border_width}px solid ${this.property.knob_border_color}`,
          left: `${
            (this.property.value /
              (this.property.range_max - this.property.range_min)) *
              this.property.width -
            this.property.height / 2 -
            3 -
            4
          }px`,
        });

      updatePos.bind(this)(element);
    },
  },
  build: async function (simulator, pagename, output_path) {
    let indexGradDir2Var = [
      "LV_GRAD_DIR_NONE",
      "LV_GRAD_DIR_HOR",
      "LV_GRAD_DIR_VER",
    ];

    let code = "";
    let header = "";

    header += `lv_obj_t* ${this.property.name};\n`;
    if (this.property.handler.length > 0 && !simulator) {
      header += `extern void ${this.property.handler}(lv_obj_t*, lv_event_t);\n`;
    }

    code += `${this.property.name} = lv_slider_create(${
      !this.property.parent ? "lv_scr_act()" : this.property.parent
    }, NULL);\n`;
    code += "\n";

    code += `lv_obj_set_style_local_bg_color(${
      this.property.name
    }, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.background_main_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_bg_grad_color(${
      this.property.name
    }, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.background_grad_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_bg_grad_dir(${
      this.property.name
    }, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, ${
      indexGradDir2Var[+this.property.background_grad_dir]
    });\n`;
    code += `lv_obj_set_style_local_radius(${this.property.name}, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, ${this.property.background_radius});\n`;
    code += `lv_obj_set_style_local_border_color(${
      this.property.name
    }, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.background_border_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_border_width(${this.property.name}, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, ${this.property.background_border_width});\n`;
    code += "\n";

    code += `lv_obj_set_style_local_bg_color(${
      this.property.name
    }, LV_SLIDER_PART_INDIC, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.indicator_main_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_bg_grad_color(${
      this.property.name
    }, LV_SLIDER_PART_INDIC, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.indicator_grad_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_bg_grad_dir(${
      this.property.name
    }, LV_SLIDER_PART_INDIC, LV_STATE_DEFAULT, ${
      indexGradDir2Var[+this.property.indicator_grad_dir]
    });\n`;
    code += `lv_obj_set_style_local_radius(${this.property.name}, LV_SLIDER_PART_INDIC, LV_STATE_DEFAULT, ${this.property.background_radius});\n`;
    code += `lv_obj_set_style_local_border_color(${
      this.property.name
    }, LV_SLIDER_PART_INDIC, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.indicator_border_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_border_width(${this.property.name}, LV_SLIDER_PART_INDIC, LV_STATE_DEFAULT, ${this.property.indicator_border_width});\n`;
    code += "\n";

    code += `lv_obj_set_style_local_bg_color(${
      this.property.name
    }, LV_SLIDER_PART_KNOB, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.knob_main_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_bg_grad_color(${
      this.property.name
    }, LV_SLIDER_PART_KNOB, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.knob_grad_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_bg_grad_dir(${
      this.property.name
    }, LV_SLIDER_PART_KNOB, LV_STATE_DEFAULT, ${
      indexGradDir2Var[+this.property.knob_grad_dir]
    });\n`;
    code += `lv_obj_set_style_local_radius(${this.property.name}, LV_SLIDER_PART_KNOB, LV_STATE_DEFAULT, LV_RADIUS_CIRCLE);\n`;
    code += `lv_obj_set_style_local_border_color(${
      this.property.name
    }, LV_SLIDER_PART_KNOB, LV_STATE_DEFAULT, lv_color_hex(0x${this.property.knob_border_color.substring(
      1
    )}));\n`;
    code += `lv_obj_set_style_local_border_width(${this.property.name}, LV_SLIDER_PART_KNOB, LV_STATE_DEFAULT, ${this.property.knob_border_width});\n`;
    code += "\n";

    code += `lv_obj_set_style_local_outline_width(${this.property.name}, LV_SLIDER_PART_BG, LV_STATE_DEFAULT, 0);\n`;
    code += "\n";

    code += `lv_obj_set_size(${this.property.name}, ${this.property.width}, ${this.property.height});\n`;
    code += `lv_obj_align(${this.property.name}, NULL, ${propertyToAlign(
      this.property
    )}, ${this.property.x}, ${this.property.y});\n`;
    code += `${
      this.property.handler.length > 0 && !simulator ? "" : "// "
    }lv_obj_set_event_cb(${this.property.name}, ${this.property.handler});\n`;
    code += "\n";

    code += `lv_slider_set_range(${this.property.name}, ${this.property.range_min}, ${this.property.range_max});\n`;
    code += `lv_slider_set_value(${this.property.name}, ${this.property.value}, LV_ANIM_OFF);\n`;
    code += `\n`;

    code += `lv_obj_set_hidden(${this.property.name}, ${
      this.property.hidden === 0 ? "true" : "false"
    });`;
    code += `\n`;

    /*
    // Style
    header += `static lv_style_t ${this.property.name}_bg_style;\n`;
    header += `static lv_style_t ${this.property.name}_indic_style;\n`;
    header += `static lv_style_t ${this.property.name}_knob_style;\n`;
    header += "\n";

    code += `lv_style_copy(&${this.property.name}_bg_style, &lv_style_pretty);\n`;
    code += `${this.property.name}_bg_style.body.radius = ${this.property.background_radius};\n`;
    code += `${this.property.name}_bg_style.body.main_color = lv_color_hex(0x${this.property.background_main_color.substring(1)});\n`;
    code += `${this.property.name}_bg_style.body.grad_color = lv_color_hex(0x${this.property.background_grad_color.substring(1)});\n`;
    code += `${this.property.name}_bg_style.body.padding.left = ${this.property.background_padding};\n`;
    code += `${this.property.name}_bg_style.body.padding.right = ${this.property.background_padding};\n`;
    code += `${this.property.name}_bg_style.body.padding.top = ${this.property.background_padding};\n`;
    code += `${this.property.name}_bg_style.body.padding.bottom = ${this.property.background_padding};\n`;
    code += `${this.property.name}_bg_style.body.border.color = lv_color_hex(0x${this.property.background_border_color.substring(1)});\n`;
    code += `${this.property.name}_bg_style.body.border.width = ${this.property.background_border_width};\n`;
    code += "\n";

    code += `lv_style_copy(&${this.property.name}_indic_style, &lv_style_pretty_color);\n`;
    code += `${this.property.name}_indic_style.body.radius = ${this.property.indicator_radius};\n`;
    code += `${this.property.name}_indic_style.body.main_color = lv_color_hex(0x${this.property.indicator_main_color.substring(1)});\n`;
    code += `${this.property.name}_indic_style.body.grad_color = lv_color_hex(0x${this.property.indicator_grad_color.substring(1)});\n`;
    code += `${this.property.name}_indic_style.body.padding.left = ${this.property.indicator_padding};\n`;
    code += `${this.property.name}_indic_style.body.padding.right = ${this.property.indicator_padding};\n`;
    code += `${this.property.name}_indic_style.body.padding.top = ${this.property.indicator_padding};\n`;
    code += `${this.property.name}_indic_style.body.padding.bottom = ${this.property.indicator_padding};\n`;
    code += `${this.property.name}_indic_style.body.border.color = lv_color_hex(0x${this.property.indicator_border_color.substring(1)});\n`;
    code += `${this.property.name}_indic_style.body.border.width = ${this.property.indicator_border_width};\n`;
    code += "\n";

    code += `lv_style_copy(&${this.property.name}_knob_style, &lv_style_pretty);\n`;
    code += `${this.property.name}_knob_style.body.main_color = lv_color_hex(0x${this.property.knob_main_color.substring(1)});\n`;
    code += `${this.property.name}_knob_style.body.grad_color = lv_color_hex(0x${this.property.knob_grad_color.substring(1)});\n`;
    code += `${this.property.name}_knob_style.body.radius = LV_RADIUS_CIRCLE;\n`;
    code += `${this.property.name}_knob_style.body.border.color = lv_color_hex(0x${this.property.knob_border_color.substring(1)});\n`;
    code += `${this.property.name}_knob_style.body.border.width = ${this.property.knob_border_width};\n`;
    code += "\n";
    
    header += `lv_obj_t* ${this.property.name};\n`;
    if (this.property.handler.length > 0 && !simulator) {
      header += `extern void ${this.property.handler}(lv_obj_t*, lv_event_t);\n`;
    }

    code += `${this.property.name} = lv_slider_create(${!this.property.parent ? 'lv_scr_act()' : this.property.parent}, NULL);\n`;
    code += `lv_slider_set_style(${this.property.name}, LV_SLIDER_STYLE_BG, &${this.property.name}_bg_style);\n`;
    code += `lv_slider_set_style(${this.property.name}, LV_SLIDER_STYLE_INDIC, &${this.property.name}_indic_style);\n`;
    code += `lv_slider_set_style(${this.property.name}, LV_SLIDER_STYLE_KNOB, &${this.property.name}_knob_style);\n`;
    code += `lv_obj_set_size(${this.property.name}, ${this.property.width}, ${this.property.height});\n`;
    code += `lv_obj_align(${this.property.name}, NULL, ${propertyToAlign(this.property)}, ${this.property.x}, ${this.property.y});\n`;
    code += `${this.property.handler.length > 0 && !simulator ? '' : '// '}lv_obj_set_event_cb(${this.property.name}, ${this.property.handler});\n`;

    code += "\n";
    code += `lv_slider_set_range(${this.property.name}, ${this.property.range_min}, ${this.property.range_max});\n`;
    code += `lv_slider_set_value(${this.property.name}, ${this.property.value}, LV_ANIM_OFF);\n`;
    code += `\n`;

    code += `lv_obj_set_hidden(${this.property.name}, ${this.property.hidden === 0 ? 'true' : 'false'});`;
    code += `\n`;
*/
    if (this.property.define == 0) {
      // define local
      code = `${header}\n${code}`;
      header = "";
    }

    return { header, content: code };
  },
});
