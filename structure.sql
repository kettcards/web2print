-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 17. Mrz 2021 um 01:51
-- Server-Version: 10.4.17-MariaDB
-- PHP-Version: 8.0.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `web2print`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `card`
--

CREATE TABLE `card` (
  `id` int(11) NOT NULL,
  `backMotive` tinyblob DEFAULT NULL,
  `frontMotive` tinyblob DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `thumbSlug` varchar(255) DEFAULT NULL,
  `cardFormat_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `card_format`
--

CREATE TABLE `card_format` (
  `id` int(11) NOT NULL,
  `defaultBackMotive` tinyblob DEFAULT NULL,
  `defaultFrontMotive` tinyblob DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `width` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `fold`
--

CREATE TABLE `fold` (
  `id` int(11) NOT NULL,
  `angle` int(11) DEFAULT NULL,
  `x1` int(11) DEFAULT NULL,
  `x2` int(11) DEFAULT NULL,
  `y1` int(11) DEFAULT NULL,
  `y2` int(11) DEFAULT NULL,
  `cardFormat_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `geometry`
--

CREATE TABLE `geometry` (
  `id` int(11) NOT NULL,
  `cut` int(11) DEFAULT NULL,
  `geometry` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `geometry_map`
--

CREATE TABLE `geometry_map` (
  `side` varchar(255) DEFAULT NULL,
  `card_id` int(11) NOT NULL,
  `geometry_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `material`
--

CREATE TABLE `material` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `textureSlug` varchar(255) DEFAULT NULL,
  `tiling` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `motive`
--

CREATE TABLE `motive` (
  `id` int(11) NOT NULL,
  `textureSlug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKt7g17brr6yx4c63b19m34t0wv` (`cardFormat_id`),
  ADD KEY `FKcpdfoqo1qea5avldd95orslat` (`material_id`);

--
-- Indizes für die Tabelle `card_format`
--
ALTER TABLE `card_format`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `fold`
--
ALTER TABLE `fold`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8a3h6y8carnwajdacssndwg15` (`cardFormat_id`);

--
-- Indizes für die Tabelle `geometry`
--
ALTER TABLE `geometry`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `geometry_map`
--
ALTER TABLE `geometry_map`
  ADD PRIMARY KEY (`card_id`,`geometry_id`),
  ADD KEY `FKaexa57kjhk14vqqvqtt4dtlfd` (`geometry_id`);

--
-- Indizes für die Tabelle `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `motive`
--
ALTER TABLE `motive`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `card`
--
ALTER TABLE `card`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `card_format`
--
ALTER TABLE `card_format`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `fold`
--
ALTER TABLE `fold`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `geometry`
--
ALTER TABLE `geometry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `material`
--
ALTER TABLE `material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `motive`
--
ALTER TABLE `motive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `FKcpdfoqo1qea5avldd95orslat` FOREIGN KEY (`material_id`) REFERENCES `material` (`id`),
  ADD CONSTRAINT `FKt7g17brr6yx4c63b19m34t0wv` FOREIGN KEY (`cardFormat_id`) REFERENCES `card_format` (`id`);

--
-- Constraints der Tabelle `fold`
--
ALTER TABLE `fold`
  ADD CONSTRAINT `FK1kip4glw0630effigd5yscxty` FOREIGN KEY (`id`) REFERENCES `card_format` (`id`),
  ADD CONSTRAINT `FK8a3h6y8carnwajdacssndwg15` FOREIGN KEY (`cardFormat_id`) REFERENCES `card_format` (`id`);

--
-- Constraints der Tabelle `geometry_map`
--
ALTER TABLE `geometry_map`
  ADD CONSTRAINT `FK65pbogp0qtrhjv8jn6ohoyds5` FOREIGN KEY (`card_id`) REFERENCES `card` (`id`),
  ADD CONSTRAINT `FKaexa57kjhk14vqqvqtt4dtlfd` FOREIGN KEY (`geometry_id`) REFERENCES `geometry` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
