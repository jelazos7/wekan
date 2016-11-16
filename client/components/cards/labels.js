let labelColors;
let labelSymbols;
Meteor.startup(() => {
  labelColors = Boards.simpleSchema()._schema['labels.$.color'].allowedValues;
  labelSymbols = Boards.simpleSchema()._schema['labels.$.symbol'].allowedValues;
});

BlazeComponent.extendComponent({
  onCreated() {
    this.currentColor = new ReactiveVar(this.data().color);
    this.currentSymbol = new ReactiveVar(this.data().symbol);
  },

  labels() {
    return labelColors.map((color) => ({ color, name: '' }));
  },

  symbols() {
    return labelSymbols.map((symbol) => ({ symbol, name: ''}));
  },

  isColorSelected(color) {
    return this.currentColor.get() === color;
  },

  isSymbolSelected(symbol) {
    return this.currentSymbol.get() === symbol;
  },

  events() {
    return [{
      'click .js-palette-color'() {
        this.currentColor.set(this.currentData().color);
    }},{
      'click .js-palette-symbol'() {
        this.currentSymbol.set(this.currentData().symbol);
    }}];
  },
}).register('formLabel');

Template.createLabelPopup.helpers({
  // This is the default color for a new label. We search the first color that
  // is not already used in the board (although it's not a problem if two
  // labels have the same color).
  defaultColor() {
    const labels = Boards.findOne(Session.get('currentBoard')).labels;
    const usedColors = _.pluck(labels, 'color');
    const availableColors = _.difference(labelColors, usedColors);
    return availableColors.length > 1 ? availableColors[0] : labelColors[0];
  },
});

Template.cardLabelsPopup.events({
  'click .js-select-label'(evt) {
    const card = Cards.findOne(Session.get('currentCard'));
    const labelId = this._id;
    card.toggleLabel(labelId);
    evt.preventDefault();
  },
  'click .js-edit-label': Popup.open('editLabel'),
  'click .js-add-label': Popup.open('createLabel'),
});

Template.formLabel.events({
  'click .js-palette-color'(evt) {
    const $this = $(evt.currentTarget);

    // hide selected ll colors
    $('.js-palette-select').addClass('hide');

    // show select color
    $this.find('.js-palette-select').removeClass('hide');
  },
});

Template.createLabelPopup.events({
  // Create the new label
  'submit .create-label'(evt, tpl) {
    evt.preventDefault();
    const board = Boards.findOne(Session.get('currentBoard'));
    const name = tpl.$('#labelName').val().trim();
    const color = Blaze.getData(tpl.find('.fa-check')).color;
    const symbol = Blaze.getData(tpl.find('.palette-symbol-selected')).symbol;
    board.addLabel(name, color, symbol);
    Popup.back();
  },
});

Template.editLabelPopup.events({
  'click .js-delete-label': Popup.afterConfirm('deleteLabel', function() {
    const board = Boards.findOne(Session.get('currentBoard'));
    board.removeLabel(this._id);
    Popup.back(2);
  }),
  'submit .edit-label'(evt, tpl) {
    evt.preventDefault();
    const board = Boards.findOne(Session.get('currentBoard'));
    const name = tpl.$('#labelName').val().trim();
    const color = Blaze.getData(tpl.find('.fa-check')).color;
    const symbol = Blaze.getData(tpl.find('.palette-symbol-selected')).symbol;
    board.editLabel(this._id, name, color, symbol);
    Popup.back();
  },
});

Template.cardLabelsPopup.helpers({
  isLabelSelected(cardId) {
    return _.contains(Cards.findOne(cardId).labelIds, this._id);
  },
});
