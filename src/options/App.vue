<template>
  <v-app id="app" v-if="dataLoaded">
    <div class="section">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_gestures') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_zoomGesture')"
            :items="listItems.zoomGesture"
            v-model="options.zoomGesture"
          >
          </vn-select>
        </div>
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_resetZoomGesture')"
            :items="listItems.resetZoomGesture"
            v-model="options.resetZoomGesture"
          >
          </vn-select>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_misc') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_appTheme')"
            :items="listItems.appTheme"
            v-model="options.appTheme"
          >
          </vn-select>
        </div>
        <div class="option text-field">
          <vn-text-field
            :label="getText('optionTitle_zoomFactors')"
            v-model="staticZoomFactors"
            @update:modelValue="saveZoomFactors($event.trim())"
          >
          </vn-text-field>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_ignoreZoomGestureSelection')"
            v-model="options.ignoreZoomGestureSelection"
          ></vn-switch>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_reverseZoomDirection')"
            v-model="options.reverseZoomDirection"
          ></vn-switch>
        </div>
        <div class="option" v-if="enableContributions">
          <vn-switch
            :label="getText('optionTitle_showContribPage')"
            v-model="options.showContribPage"
          ></vn-switch>
        </div>
        <div class="option button" v-if="enableContributions">
          <vn-button
            class="contribute-button vn-icon--start"
            @click="showContribute"
            ><vn-icon src="/src/contribute/assets/heart.svg"></vn-icon>
            {{ getText('buttonLabel_contribute') }}
          </vn-button>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import {toRaw} from 'vue';
import {Button, Icon, Select, Switch, TextField} from 'vueton';

import storage from 'storage/storage';
import {getListItems, showContributePage} from 'utils/app';
import {getText} from 'utils/common';
import {enableContributions} from 'utils/config';
import {optionKeys, chromeZoomFactors, firefoxZoomFactors} from 'utils/data';

export default {
  components: {
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Select.name]: Select,
    [Switch.name]: Switch,
    [TextField.name]: TextField
  },

  data: function () {
    return {
      dataLoaded: false,

      listItems: {
        ...getListItems(
          {zoomGesture: ['primary_wheel', 'secondary_wheel', 'false']},
          {scope: 'optionValue_zoomGesture'}
        ),
        ...getListItems(
          {
            resetZoomGesture: [
              'primary_secondary',
              'secondary_primary',
              'primary_auxiliary',
              'secondary_auxiliary',
              'false'
            ]
          },
          {scope: 'optionValue_resetZoomGesture'}
        ),
        ...getListItems(
          {appTheme: ['auto', 'light', 'dark']},
          {scope: 'optionValue_appTheme'}
        )
      },

      staticZoomFactors: '',
      enableContributions,

      options: {
        zoomGesture: '',
        reverseZoomDirection: false,
        resetZoomGesture: '',
        zoomFactors: [],
        appTheme: '',
        showContribPage: false,
        ignoreZoomGestureSelection: false
      }
    };
  },

  methods: {
    getText,

    saveZoomFactors: function (value) {
      const defaultZoomFactors =
        this.$env.isFirefox ? firefoxZoomFactors : chromeZoomFactors;

      const minValue = defaultZoomFactors.at(0);
      const maxValue = defaultZoomFactors.at(-1);

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
        zoomFactors.push(...defaultZoomFactors);
      }

      this.options.zoomFactors = zoomFactors;
    },

    loadZoomFactors: function () {
      this.staticZoomFactors = this.options.zoomFactors.join(', ');
    },

    showContribute: async function () {
      await showContributePage();
    }
  },

  created: async function () {
    const options = await storage.get(optionKeys);

    for (const option of Object.keys(this.options)) {
      this.options[option] = options[option];

      this.$watch(
        `options.${option}`,
        async function (value) {
          await storage.set({[option]: toRaw(value)});
          await browser.runtime.sendMessage({id: 'optionChange'});
        },
        {deep: true}
      );
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
@use 'vueton/styles' as vueton;

@include vueton.theme-base;

.v-application__wrap {
  display: grid;
  grid-row-gap: 32px;
  grid-column-gap: 48px;
  padding: 24px;
  grid-auto-rows: min-content;
  grid-auto-columns: min-content;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.25px;
  line-height: 32px;
}

.option-wrap {
  display: grid;
  grid-row-gap: 24px;
  padding-top: 24px;
}

.option {
  display: flex;
  align-items: center;
  height: 20px;

  &.button {
    height: 40px;
  }

  &.select,
  &.text-field {
    height: 56px;
  }

  &.text-field .v-input__control {
    width: 342px;
  }

  & .contribute-button {
    @include vueton.theme-prop(color, primary);

    & .vn-icon {
      @include vueton.theme-prop(background-color, cta);
    }
  }
}
</style>
