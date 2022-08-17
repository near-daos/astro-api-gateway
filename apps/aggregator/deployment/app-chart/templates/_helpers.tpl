{{/*
Create variables for aggregator deployment
*/}}

{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "sputnik-v2-aggregator.name" -}}
{{- default .Chart.Name .Values.aggregatorNameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "sputnik-v2-aggregator.fullname" -}}
{{- if .Values.aggregatorFullnameOverride -}}
{{- .Values.aggregatorFullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.aggregatorNameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "sputnik-v2-aggregator.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "sputnik-v2-aggregator.labels" -}}
helm.sh/chart: {{ include "sputnik-v2-aggregator.chart" . }}
{{ include "sputnik-v2-aggregator.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if eq .Values.environment.DATADOG_APM_ENABLED "true" }}
tags.datadoghq.com/env: "{{ .Values.environment.DATADOG_ENV }}"
tags.datadoghq.com/service: astro-aggregator
tags.datadoghq.com/version: 0.0.3
{{- end -}}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "sputnik-v2-aggregator.selectorLabels" -}}
app.kubernetes.io/name: {{ include "sputnik-v2-aggregator.name" . }}
app.kubernetes.io/instance: "sputnik-v2-api"
{{- end -}}

{{/*
Metadata labels
*/}}
{{- define "sputnik-v2-aggregator.metadataLabels" -}}
app.kubernetes.io/name: {{ include "sputnik-v2-aggregator.name" . }}
app.kubernetes.io/instance: "sputnik-v2-aggregator"
{{- if eq .Values.environment.DATADOG_APM_ENABLED "true" }}
tags.datadoghq.com/env: "{{ .Values.environment.DATADOG_ENV }}"
tags.datadoghq.com/service: astro-aggregator
tags.datadoghq.com/version: 0.0.3
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "sputnik-v2-aggregator.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "sputnik-v2-aggregator.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "node.maxOldSpaceSize" -}}
{{/* get memory limit and set max old space size equal to it minus 200Mb for other areas */}}
{{- $size := toString .Values.resources.limits.memory -}}
{{- if regexMatch "([0-9]+)[Mm][Ii]$" $size -}}
{{- $size = mustRegexReplaceAll "([0-9]+)[Mm][Ii]" $size "$1" -}}
{{- end -}}
{{- if regexMatch "([0-9]+)[Mm]$" $size -}}
{{- $size = mul (mustRegexReplaceAll "([0-9]+)[Mm]" $size "$1") 0.976 -}}
{{- end -}}
{{- if regexMatch "([0-9]+)[Gg][Ii]$" $size -}}
{{- $size = mul (mustRegexReplaceAll "([0-9]+)[Gg][Ii]" $size "$1") 1024 -}}
{{- end -}}
{{- if regexMatch "([0-9]+)[Gg]$" $size -}}
{{- $size = mul (mustRegexReplaceAll "([0-9]+)[Gg]" $size "$1") 976 -}}
{{- end -}}
{{- $size = toString (sub (int $size) 200) -}}
{{- printf  $size -}}
{{- end -}}
