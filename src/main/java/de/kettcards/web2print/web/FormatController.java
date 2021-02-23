package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}")
public final class FormatController {

    @Autowired
    private CardService cardService;

    @GetMapping({"/aspectRatio", "/format"})
    public List<CardFormat> getRatio() {
        return cardService.listCardFormats();
    }

    @PostMapping({"/aspectRatio" , "/format"})
    public void addRatio(@RequestBody CardFormat cardFormat) {
        cardService.updateCardFormat(cardFormat);
    }


    @GetMapping({"/aspectRatio/{id}", "/format/{id}"})
    public CardFormat getRatios(@PathVariable Integer id) {
        return cardService.findCardFormat(id);
    }

}
