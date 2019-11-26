CREATE DATABASE  IF NOT EXISTS `patient` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `patient`;
-- MySQL dump 10.13  Distrib 5.7.28, for Linux (x86_64)
--
-- Host: localhost    Database: patient
-- ------------------------------------------------------
-- Server version	5.7.28-0ubuntu0.18.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `data`
--

DROP TABLE IF EXISTS `data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data` (
  `userid` int(11) NOT NULL,
  `uploadDate` date DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `info` text,
  KEY `userid` (`userid`),
  CONSTRAINT `data_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data`
--

LOCK TABLES `data` WRITE;
/*!40000 ALTER TABLE `data` DISABLE KEYS */;
INSERT INTO `data` VALUES (12,'2013-09-18','check','everything ok'),(11,'2019-11-21','check','feels tired, better to sleep a lot tomorrow'),(12,'2019-11-21','check','feels tired, better to sleep a lot tomorrow'),(12,'2019-11-21','bloodAnalysis','too high colesterolo'),(10,'2019-11-21','bloodAnalysis','too high colesterolo'),(11,'2019-11-21','doctor','feeling sore'),(12,'2019-11-21','doctor','feeling sore');
/*!40000 ALTER TABLE `data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tempData`
--

DROP TABLE IF EXISTS `tempData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tempData` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `uploaderName` varchar(40) NOT NULL,
  `uploadDate` date DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `info` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tempData`
--


--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(40) DEFAULT NULL,
  `category` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (0,'Antonio','1983-09-09','Milano','doctor'),(2,'Health Club 1',NULL,'Hengelo','healthclub'),(10,'Riccardo','1990-03-20','Milano','patient'),(11,'Damiano','2000-03-20','Bassano','patient'),(12,'Giovanni','2000-10-20','Vicenza','patient'),(14,'Hospital1',NULL,'Enschede','hospital'),(20,'MSThospital',NULL,'Enschede','hospital'),(21,'The Doctor','1965-12-20','Vicenza','doctor'),(22,'Doctor House','1975-01-24','New York','doctor'),(27,'Memorial Hospital',NULL,'Washington','hospital'),(30,'Public Hospital',NULL,'Amsterdam','hospital'),(31,'Training center',NULL,'Amsterdam','healthclub'),(32,'Run Boy Run',NULL,'Paris','healthclub'),(40,'Employer','1980-12-02','Utrecht','employer'),(41,'The Boss','1960-10-02','Arnhem','employer'),(7408,'Silvio2','1984-09-09','Mezzocorona','employer'),(12622,'Tony','2019-09-09','Home','patient'),(21545,'Silvio','1983-09-09','Trento','employer'),(25414,'Antonio2','1983-09-09','Milano','doctor');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-11-26 12:38:24
