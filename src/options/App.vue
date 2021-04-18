<template>
  <div id="app" v-if="dataLoaded">
    <div class="section">
      <div class="option-wrap">
        <div class="option select">
          <v-select
            :label="getText('optionTitle_zoomGesture')"
            v-model="options.zoomGesture"
            :options="selectOptions.zoomGesture"
          >
          </v-select>
        </div>
        <div class="option">
          <v-form-field
            input-id="rzd"
            :label="getText('optionTitle_reverseZoomDirection')"
          >
            <v-switch
              id="rzd"
              v-model="options.reverseZoomDirection"
            ></v-switch>
          </v-form-field>
        </div>
        <div class="option select">
          <v-select
            :label="getText('optionTitle_resetZoomGesture')"
            v-model="options.resetZoomGesture"
            :options="selectOptions.resetZoomGesture"
          >
          </v-select>
        </div>
        <div class="option text-field">
          <v-textfield
            :value="staticZoomFactors"
            :label="getText('inputLabel_zoomFactors')"
            @input="saveZoomFactors($event.trim())"
          >
          </v-textfield>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {FormField, Switch, Select, TextField} from 'ext-components';

import storage from 'storage/storage';
import {getOptionLabels} from 'utils/app';
import {getText} from 'utils/common';
import {targetEnv} from 'utils/config';
import {optionKeys, chromeZoomFactors, firefoxZoomFactors} from 'utils/data';

export default {
  components: {
    [Select.name]: Select,
    [FormField.name]: FormField,
    [Switch.name]: Switch,
    [TextField.name]: TextField
  },

  data: function () {
    return {
      dataLoaded: false,

      selectOptions: getOptionLabels({
        zoomGesture: ['primary_wheel', 'secondary_wheel'],
        resetZoomGesture: [
          'primary_secondary',
          'secondary_primary',
          'primary_auxiliary',
          'secondary_auxiliary'
        ]
      }),

      staticZoomFactors: '',

      options: {
        zoomGesture: '',
        reverseZoomDirection: false,
        resetZoomGesture: '',
        zoomFactors: []
      }
    };
  },

  methods: {
    getText,

    saveZoomFactors: function (value) {
      const minValue = targetEnv === 'firefox' ? 0.3 : 0.25;
      const maxValue = 5;

      const zoomFactors = value
        .split(',')
        .map(item => {
          let zoomFactor = parseFloat(item);
          if (zoomFactor < minValue || zoomFactor > maxValue) {
            zoomFactor = NaN;
          }

          return zoomFactor;
        })
        .filter(Boolean);

      if (!zoomFactors.length) {
        zoomFactors.push(
          ...(targetEnv === 'firefox' ? firefoxZoomFactors : chromeZoomFactors)
        );
      }

      this.options.zoomFactors = zoomFactors;
    },

    loadZoomFactors: function () {
      this.staticZoomFactors = this.options.zoomFactors.join(', ');
    }
  },

  created: async function () {
    const options = await storage.get(optionKeys, 'sync');

    for (const option of Object.keys(this.options)) {
      this.options[option] = options[option];
      this.$watch(`options.${option}`, async function (value) {
        await storage.set({[option]: value}, 'sync');
      });
    }

    document.title = getText('pageTitle', [
      getText('pageTitle_options'),
      getText('extensionName')
    ]);

    this.loadZoomFactors();

    this.dataLoaded = true;
  }
};
</script>

<style lang="scss">
$mdc-theme-primary: #1abc9c;

@import '@material/select/mdc-select';
@import '@material/typography/mixins';

body {
  @include mdc-typography-base;
  font-size: 100%;
  background-color: #ffffff;
  overflow: visible !important;
  margin: 0;
}

#app {
  display: grid;
  grid-row-gap: 32px;
  padding: 24px;
}

.mdc-switch {
  margin-right: 16px;
}

.option-wrap {
  display: grid;
  grid-row-gap: 24px;
  padding-top: 24px;
  grid-auto-columns: min-content;
}

.option {
  display: flex;
  align-items: center;
  height: 24px;

  & .mdc-form-field {
    max-width: calc(100vw - 48px);

    & label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.option {
  &.select,
  &.text-field {
    height: 56px;
  }
}

.option.select {
  align-items: start;

  & .mdc-select__anchor,
  & .mdc-select__menu {
    max-width: calc(100vw - 48px);
  }

  & .mdc-select__selected-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
