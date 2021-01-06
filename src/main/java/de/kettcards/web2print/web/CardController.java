package de.kettcards.web2print.web;


import de.kettcards.web2print.config.Web2PrintApplicationConfiguration;
import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("${web2print.links.api-path}")
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private Web2PrintApplicationConfiguration configuration;

    @GetMapping("/cards")
    public Page<CardOverview> getCardOverview(@RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size) {
        if (page == null)
            page = 0;
        if (size == null)
            size = 25;
        if (page < 0 || size < 1 || size > configuration.getPage().getMaxPageSize())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);

        return cardRepository.findAllProjectedBy(PageRequest.of(page, Integer.MAX_VALUE), CardOverview.class); //TODO quickfix for now
    }

    @GetMapping("/card/{card}")
    public Card getCard(@PathVariable String card) {
        return cardRepository.findCardByOrderId(card);
    }

}
