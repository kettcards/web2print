package de.kettcards.web2print.service;

import de.kettcards.web2print.config.Web2PrintApplicationConfiguration;
import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.repository.CardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

@Service
public class CardService {
    private final CardRepository cardRepository;

    private final Web2PrintApplicationConfiguration configuration;

    public CardService(CardRepository cardRepository, Web2PrintApplicationConfiguration configuration) {
        this.cardRepository = cardRepository;
        this.configuration = configuration;
    }

    public Card findCard(@NonNull String orderId) {
        return cardRepository.findCardByOrderId(orderId);
    }

    public Page<CardOverview> listCardOverview(@Nullable Integer page,
                                               @Nullable Integer size) {
        if (page == null)
            page = 0;
        if (size == null)
            size = configuration.getPage().getDefaultPageSize();
        if (page < 0 || size < 1 || size > configuration.getPage().getMaxPageSize())
            throw new IllegalArgumentException();

        return cardRepository.findAllProjectedBy(PageRequest.of(page, size), CardOverview.class);
    }
}
