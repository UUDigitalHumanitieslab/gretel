from django.db import models


class CanonicalForm(models.Model):
    text = models.TextField(unique=True)

    def __str__(self):
        return self.text


class XPathQuery(models.Model):
    class Meta:
        verbose_name = 'XPath Query'
        verbose_name_plural = 'XPath Queries'

    canonical = models.ForeignKey(CanonicalForm, on_delete=models.PROTECT)
    xpath = models.TextField()
    description = models.CharField(max_length=200)
    rank = models.PositiveSmallIntegerField()
