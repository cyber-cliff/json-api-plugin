if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		if (typeof args[0] === typeof ({})) args = args[0];
		var result = this;
		jQuery.each(args, (name, value) => {
			result = result.replace("\{" + name + "\}", value)
		});
		return result;
	};
}
class MergeModel {
	constructor(name) {
		this.name = name;
		this.patterns = [];
	}
	merge(data) {
		if (typeof data !== typeof ({})) throw new TypeError("You must use a dictionary!");
		var masterPattern = "";
		this.patterns.forEach((p) => masterPattern += p);
		masterPattern = masterPattern.replace(/\./g, ".").replace(/\,/g, ",").replace(/\\/g, "\\");
		return masterPattern.format(data);
	}
}
class TableHeader {
	constructor(name, isTitle, isSubtitle, isFooter, isActionLinks, footerPattern = undefined, mergeModel = undefined) {
		this.name = name;
		this.isTitle = isTitle;
		this.isSubtitle = isSubtitle;
		this.isFooter = isFooter;
		this.isActionLinks = isActionLinks;
		this.footerPattern = footerPattern;
		this.mergeModel = mergeModel;
	}
}
function tableToCards() {
	jQuery("table.table").each(function (j, table) {
		if (table.hasAttribute("data-card-ignore")) return;
		const tableId = jQuery(this).attr("id");
		if (tableId === undefined) {
			console.error("All tables need an ID for tableToCards to work properly!");
		}
		jQuery(`div.table-card-deck#${tableId}`).remove();
		var cardWidth = jQuery(this).attr("data-card-width");
		if (cardWidth === undefined) cardWidth = 566;
		if (jQuery(window).width() > cardWidth) {
			jQuery(this).show();
			return;
		}
		var headers = [];
		var mergeModels = {};
		jQuery(this).find("thead tr th").each((i, th) => {
			if (!th.hasAttribute("data-card-merge-name") || !th.hasAttribute("data-card-merge-index")) return;
			var mergeName = $(th).attr("data-card-merge-name"),
			mergeIndex = $(th).attr("data-card-merge-index"),
			mergePattern = $(th).attr("data-card-merge-pattern");
			if (mergePattern === undefined) mergePattern = "{0} ";
			if (mergeModels[mergeName] === undefined) mergeModels[mergeName] = new MergeModel(mergeName);
			mergePattern = mergePattern.replace(/\{0\}/g, "{" + th.innerHTML.replace(/\s/g, "_") + "}");
			mergeModels[mergeName].patterns[mergeIndex] = mergePattern;
		});
		jQuery(this).find("thead tr th").each((i, th) => {
			headers.push(new TableHeader(
				th.innerHTML.replace(/(^\s+|\s+$)/g, ""),
				th.hasAttribute("data-card-title"),
				th.hasAttribute("data-card-subtitle"),
				th.hasAttribute("data-card-footer"),
				th.hasAttribute("data-card-action-links"),
				jQuery(th).attr("data-card-footer-pattern"),
				mergeModels[jQuery(th).attr("data-card-merge-name")]
			));
		});
		var cards = [];
		jQuery(this).find("tbody tr").each(function() {
			var cardTitle = jQuery("<h5>").addClass("card-title");
			var cardSubtitles = [];
			var cardText = jQuery("<p>").addClass("card-text");
			var cardFooters = jQuery("<div>").addClass("card-footer text-muted");
			var actionLinks = [];
			var appliedFormats = [];
			var rowData = {};
			jQuery(this).children("td").each((i, td) => rowData[headers[i].name.replace(/\s/g, "_")] = td.innerHTML.replace(/(^\s+|\s+$)/g, ""));
			jQuery(this).children("td").each(function(i, td) {
				var header = headers[i];
				if (header.isActionLinks) {
					jQuery(this).find("a").each((i, a) => actionLinks.push(
						jQuery("<a>").addClass("card-link").html(a.innerHTML).attr("onclick", jQuery(a).attr("onclick"))
					));
					return;
				}
				if (header.isTitle) {
					cardTitle.html(td.innerHTML);
					return;
				}
				if (header.isSubtitle) {
					cardSubtitles.push(
						jQuery("<h6>").addClass("card-subtitle mb-2 text-muted").html(td.innerHTML)
					);
					return;
				}
				if (header.isFooter) {
					let pattern = headers[i].footerPattern;
					if (pattern === undefined) pattern = "{0}";
					cardFooters.append(
						jQuery("<span>").html(pattern.format(td.innerHTML, headers[i].name) + " ")
					);
					return;
				}
				if (header.mergeModel === undefined) {
					cardText.append(
						jQuery("<span>").append(
							jQuery("<b>").html(header.name + ": ")
						).append(td.innerHTML).append(jQuery("<br>"))
					);
				} else {
					if (appliedFormats.indexOf(header.mergeModel.name) === -1) {
						cardText.append(
							jQuery("<span>").append(
								jQuery("<b>").html(header.mergeModel.name + ": ")
							).append(header.mergeModel.merge(rowData)).append("<br>")
						);
						appliedFormats.push(header.mergeModel.name);
					}
				}
			});
			if (cardTitle.html() === "") cardTitle = undefined;
			if (cardFooters.html() === "") cardFooters = undefined;
			cards.push(
				jQuery('<div data-role="sport">').addClass("card mb-3").append(
					jQuery("<div>").addClass("card-body")
					.append(cardTitle)
					.append(cardSubtitles)
					.append(cardText)
					.append(actionLinks)
				).append(cardFooters)
			);
		});
		var cardWrapper = jQuery("<div>").addClass("table-card-deck").attr("id", tableId);
		cards.forEach(card => {
			cardWrapper.append(card);
		});
		jQuery(this).parent().append(cardWrapper);
		jQuery(this).hide();
	});
}
jQuery(window).resize(tableToCards);
jQuery(window).ready(tableToCards);